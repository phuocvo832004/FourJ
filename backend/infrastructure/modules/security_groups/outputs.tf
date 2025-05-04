output "public_ec2_sg_id" {
  description = "ID of the security group for public EC2 instances"
  value       = aws_security_group.public_ec2.id
}

output "private_ec2_sg_id" {
  description = "ID of the security group for private EC2 instances"
  value       = aws_security_group.private_ec2.id
}

output "default_sg_id" {
  description = "ID của security group mặc định đã được import"
  value       = aws_security_group.existing_default_sg.id
} 
