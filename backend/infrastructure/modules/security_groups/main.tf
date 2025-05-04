resource "aws_security_group" "public_ec2" {
  name        = "${var.project}-${var.environment}-public-ec2-sg"
  description = "Security group for public EC2 instances (allows SSH from specific IP)"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_ip]
    description = "SSH access from specific IP"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${var.project}-${var.environment}-public-ec2-sg"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_security_group" "private_ec2" {
  name        = "${var.project}-${var.environment}-private-ec2-sg"
  description = "Security group for private EC2 instances (allows SSH from public instances only)"
  vpc_id      = var.vpc_id

  ingress {
    from_port         = 22
    to_port           = 22
    protocol          = "tcp"
    security_groups   = [aws_security_group.public_ec2.id]
    description       = "SSH access from public instances"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${var.project}-${var.environment}-private-ec2-sg"
    Environment = var.environment
    Project     = var.project
  }
}

# Quản lý security group đã tồn tại
resource "aws_security_group" "existing_default_sg" {
  # Terraform sẽ import security group này thông qua lệnh trong import.tf
  # KHÔNG thay đổi name vì đây là security group mặc định
  name        = "default"
  description = "default VPC security group"
  vpc_id      = var.vpc_id

  # Thêm rule cho phép SSH từ IP được chỉ định
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_ip]
    description = "SSH from approved IP"
  }

  # Thêm rule cho phép HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP from anywhere"
  }

  # Thêm rule cho phép HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS from anywhere"
  }
  
  # Thêm rule cho phép RDP (nếu cần kết nối Windows)
  ingress {
    from_port   = 3389
    to_port     = 3389
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_ip]
    description = "RDP from approved IP"
  }
  
  # Thêm rule cho phép ping/ICMP
  ingress {
    from_port   = -1
    to_port     = -1
    protocol    = "icmp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow ping from anywhere"
  }

  # Rule mặc định cho phép tất cả outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  # Giữ nguyên các tags mặc định
  tags = {
    Name = "default"
  }

  lifecycle {
    # Ngăn xóa security group khi xóa tài nguyên trong Terraform
    prevent_destroy = true
  }
} 
