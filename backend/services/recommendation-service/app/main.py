# services/recommendation-service/app/main.py
import pickle
import os
import socket
import time
from pathlib import Path
import numpy as np
from scipy.sparse import load_npz, csr_matrix
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from implicit.als import AlternatingLeastSquares # Import class model của bạn
from sklearn.preprocessing import LabelEncoder
import consul

# --- Cấu hình ---
ARTIFACTS_DIR = Path(__file__).parent.parent / "artifacts" # Đường dẫn tới thư mục artifacts
MODEL_PATH = ARTIFACTS_DIR / "als_model.pkl"
USER_ENCODER_PATH = ARTIFACTS_DIR / "user_encoder.pkl"
PRODUCT_ENCODER_PATH = ARTIFACTS_DIR / "product_encoder.pkl"
INTERACTION_MATRIX_PATH = ARTIFACTS_DIR / "interaction_matrix.npz"
RECOMMENDATION_COUNT = 10 # Số lượng sản phẩm gợi ý

# --- Cấu hình Consul ---
CONSUL_HOST = os.getenv("CONSUL_HOST", "consul")
CONSUL_PORT = int(os.getenv("CONSUL_PORT", "8500"))
SERVICE_NAME = "recommendation-service"
SERVICE_ID = f"{SERVICE_NAME}-{socket.gethostname()}"
SERVICE_PORT = int(os.getenv("SERVICE_PORT", "8090"))
SERVICE_CHECK_INTERVAL = "10s"
SERVICE_CHECK_TIMEOUT = "5s"
SERVICE_CHECK_DEREGISTER_AFTER = "30s"

# --- Biến toàn cục để giữ model và dữ liệu đã load ---
app_state = {}

# --- Khởi tạo ứng dụng FastAPI ---
app = FastAPI(
    title="Recommendation Service",
    description="API for getting product recommendations based on user purchase history.",
    version="0.1.0"
)

# Thêm CORS middleware
""" Comment out CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong môi trường production, chỉ định cụ thể origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
"""

# --- Hàm đăng ký dịch vụ với Consul ---
def register_with_consul():
    c = consul.Consul(host=CONSUL_HOST, port=CONSUL_PORT)
    
    # Đăng ký service với Consul
    service_definition = {
        "name": SERVICE_NAME,
        "id": SERVICE_ID,
        "address": socket.gethostname(),  # Sử dụng tên hostname của container
        "port": SERVICE_PORT,
        "tags": ["api", "recommendations", "python", "fastapi"],
        "check": {
            "http": f"http://{socket.gethostname()}:{SERVICE_PORT}/health",
            "interval": SERVICE_CHECK_INTERVAL,
            "timeout": SERVICE_CHECK_TIMEOUT,
            "deregister_critical_service_after": SERVICE_CHECK_DEREGISTER_AFTER
        }
    }
    
    try:
        c.agent.service.register(**service_definition)
        print(f"Registered service with Consul: {SERVICE_ID}")
        return True
    except Exception as e:
        print(f"Failed to register with Consul: {e}")
        return False

# --- Hàm hủy đăng ký dịch vụ khỏi Consul ---
def deregister_from_consul():
    try:
        c = consul.Consul(host=CONSUL_HOST, port=CONSUL_PORT)
        c.agent.service.deregister(SERVICE_ID)
        print(f"Deregistered service from Consul: {SERVICE_ID}")
        return True
    except Exception as e:
        print(f"Failed to deregister from Consul: {e}")
        return False

# --- Sự kiện Startup: Load model và các artifacts, đăng ký với Consul ---
@app.on_event("startup")
async def startup_events():
    # Load artifacts
    print(f"Loading artifacts from: {ARTIFACTS_DIR}")
    if not ARTIFACTS_DIR.exists():
        print(f"Error: Artifacts directory not found at {ARTIFACTS_DIR}")
        # Có thể raise lỗi ở đây hoặc xử lý khác tùy theo yêu cầu
        return

    try:
        with open(MODEL_PATH, 'rb') as f:
            app_state["model"] = pickle.load(f)
        print(f"Model loaded from {MODEL_PATH}")

        with open(USER_ENCODER_PATH, 'rb') as f:
            app_state["user_encoder"] = pickle.load(f)
            num_users_encoder = len(app_state["user_encoder"].classes_)
            print(f"User encoder loaded from {USER_ENCODER_PATH} ({num_users_encoder} users)")

        with open(PRODUCT_ENCODER_PATH, 'rb') as f:
            app_state["product_encoder"] = pickle.load(f)
            num_products_encoder = len(app_state["product_encoder"].classes_)
            print(f"Product encoder loaded from {PRODUCT_ENCODER_PATH} ({num_products_encoder} products)")

        app_state["interaction_matrix"] = load_npz(INTERACTION_MATRIX_PATH)
        num_users_matrix, num_products_matrix = app_state["interaction_matrix"].shape
        print(f"Interaction matrix loaded from {INTERACTION_MATRIX_PATH} (Shape: {num_users_matrix}x{num_products_matrix})")

        # --- Thêm kiểm tra sự nhất quán ---
        if num_products_encoder != num_products_matrix:
            print(f"CRITICAL WARNING: Mismatch in product counts! Encoder knows {num_products_encoder}, Matrix has {num_products_matrix} columns.")
            # Có thể raise lỗi hoặc đặt một cờ báo lỗi ở đây nếu muốn dừng service
        else:
            print("Product count consistency check passed.")
        # --- Kết thúc kiểm tra ---

        # Kiểm tra xem model có phải là instance của class mong đợi không
        if not isinstance(app_state.get("model"), AlternatingLeastSquares):
             print("Warning: Loaded model might not be the expected type.")

        print("Artifacts loaded successfully.")

        # Đăng ký service với Consul (thực hiện một vài lần nếu cần)
        max_attempts = 5
        attempt = 0
        registered = False

        while attempt < max_attempts and not registered:
            attempt += 1
            print(f"Attempt {attempt}/{max_attempts} to register with Consul")
            registered = register_with_consul()
            if not registered and attempt < max_attempts:
                sleep_time = 5 * attempt  # Backoff strategy
                print(f"Sleeping for {sleep_time}s before retry")
                time.sleep(sleep_time)

        if not registered:
            print("WARNING: Failed to register with Consul after multiple attempts")

    except FileNotFoundError as e:
        print(f"Error loading artifact: {e}. Make sure all artifact files exist.")
        # Xử lý lỗi nghiêm trọng hơn nếu cần
    except Exception as e:
        print(f"An unexpected error occurred during artifact loading: {e}")
        # Xử lý lỗi

# --- Sự kiện Shutdown: Hủy đăng ký khỏi Consul ---
@app.on_event("shutdown")
async def shutdown_events():
    print("Service shutting down, deregistering from Consul")
    deregister_from_consul()

# --- API Endpoint ---
@app.get("/api/v1/recommendations/{user_id}",
         summary="Get Product Recommendations for a User",
         response_description="A list of recommended product IDs")
async def get_recommendations(user_id: int):
    """
    Retrieves product recommendations for a given `user_id`.

    - **user_id**: The ID of the user to get recommendations for.
    """
    # Lấy các artifacts từ app_state một cách an toàn
    model = app_state.get("model")
    user_encoder = app_state.get("user_encoder")
    product_encoder = app_state.get("product_encoder")
    interaction_matrix = app_state.get("interaction_matrix")

    # Kiểm tra xem tất cả các artifacts cần thiết đã được load chưa
    if (model is None or
        user_encoder is None or
        product_encoder is None or
        interaction_matrix is None):
        # Ghi log lỗi nếu cần thiết để debug
        print("Error: One or more artifacts failed to load or are missing.")
        raise HTTPException(status_code=503, detail="Service Unavailable: Required artifacts not loaded.")

    print(f"\n--- Request for user_id: {user_id} ---") # Thêm log bắt đầu request

    try:
        # 1. Chuyển user_id thành user_idx
        print(f"Looking up user_id: {user_id}")
        user_idx = user_encoder.transform([user_id])[0]
        print(f"Found user_idx: {user_idx}") # Thêm log user_idx

        # 2. Lấy vector tương tác của user từ sparse matrix
        # Đảm bảo interaction_matrix là CSR để truy cập hàng hiệu quả
        if not isinstance(interaction_matrix, csr_matrix):
             interaction_matrix = interaction_matrix.tocsr() # Chuyển đổi nếu cần
        user_items_sparse = interaction_matrix[user_idx]
        print(f"User items vector shape: {user_items_sparse.shape}, Non-zero elements: {user_items_sparse.nnz}") # Thêm log vector

        # 3. Gọi hàm recommend
        print("Calling model.recommend...")
        recommended_raw = model.recommend(
            userid=user_idx,
            user_items=user_items_sparse,
            N=RECOMMENDATION_COUNT,
            filter_already_liked_items=True
        )
        print(f"Raw recommendations (item_idx, score): {recommended_raw}")

        recommended_product_idxs_raw = [int(idx) for idx in recommended_raw[0]]
        print(f"Raw recommended product_idxs: {recommended_product_idxs_raw}")

        # --- Thêm bước lọc index không hợp lệ ---
        valid_indices_mask = np.isin(recommended_product_idxs_raw, np.arange(len(product_encoder.classes_)))
        recommended_product_idxs = np.array(recommended_product_idxs_raw)[valid_indices_mask].tolist()

        if len(recommended_product_idxs) < len(recommended_product_idxs_raw):
            print(f"Filtered out invalid product_idxs. Kept: {recommended_product_idxs}")
        # --- Kết thúc bước lọc ---

        if not recommended_product_idxs:
             print("No valid product indices recommended after filtering.")
             return []

        # Gọi inverse_transform với danh sách index đã được lọc và hợp lệ
        recommended_product_ids = product_encoder.inverse_transform(recommended_product_idxs)
        print(f"Decoded product_ids: {recommended_product_ids.tolist()}")

        return [int(pid) for pid in recommended_product_ids]

    except ValueError as e:
        print(f"ValueError occurred for user_id {user_id}. Potentially invalid user ID or issue during transform/inverse_transform.")
        print(f"Error details: {e}")
        return [] # Vẫn trả về list rỗng
    except IndexError:
         # Xảy ra nếu user_idx nằm ngoài phạm vi của interaction_matrix (ít khả năng nếu encoder đúng)
         print(f"Internal Error: User index {user_idx} out of bounds for interaction matrix.")
         raise HTTPException(status_code=500, detail="Internal server error processing recommendations.")
    except Exception as e:
        # Bắt các lỗi khác không mong muốn
        print(f"An unexpected error occurred for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error generating recommendations.")

# --- Endpoint kiểm tra sức khỏe (tùy chọn) ---
@app.get("/health", status_code=200, summary="Health Check")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "ok"}

# --- Chạy server (khi chạy trực tiếp file này, chỉ dùng để debug) ---
if __name__ == "__main__":
    import uvicorn
    # Chạy từ thư mục gốc của service (recommendation-service)
    # uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
    print("To run the server, execute:")
    print("cd services/recommendation-service")
    print("uvicorn app.main:app --reload --host 0.0.0.0 --port 8090") # Chọn port khác 8080 nếu cần