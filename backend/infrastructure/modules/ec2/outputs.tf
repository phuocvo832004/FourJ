output "public_instance_ids" {
  description = "IDs of public EC2 instances"
  value       = aws_instance.public[*].id
}

output "private_instance_ids" {
  description = "IDs of private EC2 instances"
  value       = aws_instance.private[*].id
}

output "public_instance_public_ips" {
  description = "Public IP addresses of public EC2 instances"
  value       = aws_instance.public[*].public_ip
}

output "public_instance_private_ips" {
  description = "Private IP addresses of public EC2 instances"
  value       = aws_instance.public[*].private_ip
}

output "private_instance_private_ips" {
  description = "Private IP addresses of private EC2 instances"
  value       = aws_instance.private[*].private_ip
} 
