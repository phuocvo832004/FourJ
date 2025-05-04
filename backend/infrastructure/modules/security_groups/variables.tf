variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed for SSH access to public instances"
  type        = string
  default     = "0.0.0.0/0"  // Mặc định cho phép từ mọi nơi, nhưng nên thay đổi thành IP cụ thể của bạn
} 