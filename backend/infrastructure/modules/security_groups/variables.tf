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

variable "allowed_ssh_ip" {
  description = "IP address allowed to SSH into the public EC2 instance. Use x.x.x.x/32 for a single IP."
  type        = string
  default     = "0.0.0.0/0" # Cảnh báo: Cho phép truy cập từ mọi IP, không an toàn cho môi trường production
} 
