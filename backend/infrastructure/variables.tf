variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "fourj"
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed for SSH access to public instances"
  type        = string
  default     = "0.0.0.0/0"  // Mặc định cho phép từ mọi nơi, nhưng nên thay đổi thành IP cụ thể của bạn
}

variable "key_name" {
  description = "Name of the key pair to use for SSH access"
  type        = string
  default     = "aws-key-pair"  // Thay đổi thành tên key pair của bạn trên AWS
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
} 