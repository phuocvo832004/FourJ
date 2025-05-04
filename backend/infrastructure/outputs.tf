output "vpc_id" {
  description = "ID của VPC đã sử dụng"
  value       = var.existing_vpc_id
}

output "vpc_cidr" {
  description = "CIDR của VPC đã sử dụng"
  value       = "172.31.0.0/16"
}

output "public_ec2_sg_id" {
  description = "ID of the public EC2 security group"
  value       = module.security_groups.public_ec2_sg_id
}

output "private_ec2_sg_id" {
  description = "ID of the private EC2 security group"
  value       = module.security_groups.private_ec2_sg_id
}

output "default_sg_id" {
  description = "ID của security group mặc định đã import"
  value       = module.security_groups.default_sg_id
}

