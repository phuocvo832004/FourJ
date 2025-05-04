variable "aws_region" {
  description = "AWS region to deploy resources"
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
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "List of CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24"]
}

variable "private_subnet_cidrs" {
  description = "List of CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.101.0/24"]
}

variable "allowed_ssh_ip" {
  description = "IP address allowed to SSH into the public EC2 instance. Use x.x.x.x/32 for a single IP."
  type        = string
  default     = "113.185.74.136/32" 
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "ami_id" {
  description = "AMI ID for EC2 instances (Amazon Linux 2)"
  type        = string
  default     = "ami-0df7a207adb9748c7" 
}

variable "key_name" {
  description = "Name of the EC2 key pair to use for instances"
  type        = string
  default     = "newkeypair01"
}

variable "use_existing_vpc" {
  description = "Whether to use an existing VPC instead of creating a new one"
  type        = bool
  default     = true
}

variable "existing_vpc_id" {
  description = "ID of the existing VPC to use"
  type        = string
  default     = "vpc-00982aa12cac8bf08"
}

variable "existing_public_subnet_ids" {
  description = "IDs of existing public subnets"
  type        = list(string)
  default     = ["subnet-0a0a0a0a0a0a0a0a0"] # Cần cập nhật với ID thực tế
}

variable "existing_private_subnet_ids" {
  description = "IDs of existing private subnets"
  type        = list(string)
  default     = ["subnet-0b0b0b0b0b0b0b0b0"] # Cần cập nhật với ID thực tế
} 

data "aws_security_group" "default" {
  id = "sg-013c235d50d580b39"
}
