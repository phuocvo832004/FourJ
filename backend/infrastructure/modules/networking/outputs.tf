output "vpc_id" {
  description = "ID of the VPC"
  value       = local.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = var.create_vpc ? aws_subnet.public[*].id : []
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = var.create_vpc ? aws_subnet.private[*].id : []
}

output "public_route_table_id" {
  description = "ID of the public route table"
  value       = var.create_vpc && length(aws_route_table.public) > 0 ? aws_route_table.public[0].id : null
}

output "private_route_table_id" {
  description = "ID of the private route table"
  value       = var.create_vpc && length(aws_route_table.private) > 0 ? aws_route_table.private[0].id : null
}

output "igw_id" {
  description = "ID of the Internet Gateway"
  value       = var.create_vpc && length(aws_internet_gateway.main) > 0 ? aws_internet_gateway.main[0].id : null
}

output "nat_gateway_id" {
  description = "ID of the NAT Gateway"
  value       = var.create_vpc && length(aws_nat_gateway.main) > 0 ? aws_nat_gateway.main[0].id : null
}

output "nat_gateway_eip" {
  description = "Elastic IP of the NAT Gateway"
  value       = var.create_vpc && length(aws_eip.nat) > 0 ? aws_eip.nat[0].public_ip : null
} 
