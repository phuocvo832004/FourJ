output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}

output "app_security_group_id" {
  value = aws_security_group.app.id
}

output "db_security_group_id" {
  value = aws_security_group.db.id
}

output "app_instance_public_ips" {
  value = aws_instance.app[*].public_ip
}

output "nat_gateway_ips" {
  value = aws_eip.nat[*].public_ip
} 