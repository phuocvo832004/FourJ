// VPC & Networking Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.networking.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.networking.private_subnet_ids
}

output "nat_gateway_ip" {
  description = "Elastic IP of the NAT Gateway"
  value       = module.networking.nat_gateway_eip
}

// Security Group Outputs
output "public_ec2_sg_id" {
  description = "ID of the public EC2 security group"
  value       = module.security_groups.public_ec2_sg_id
}

output "private_ec2_sg_id" {
  description = "ID of the private EC2 security group"
  value       = module.security_groups.private_ec2_sg_id
}

// EC2 Instance Outputs
output "public_instance_ids" {
  description = "IDs of public EC2 instances"
  value       = module.ec2.public_instance_ids
}

output "private_instance_ids" {
  description = "IDs of private EC2 instances"
  value       = module.ec2.private_instance_ids
}

output "public_instance_public_ips" {
  description = "Public IP addresses of public EC2 instances"
  value       = module.ec2.public_instance_public_ips
}

output "public_instance_private_ips" {
  description = "Private IP addresses of public EC2 instances"
  value       = module.ec2.public_instance_private_ips
}

output "private_instance_private_ips" {
  description = "Private IP addresses of private EC2 instances"
  value       = module.ec2.private_instance_private_ips
} 