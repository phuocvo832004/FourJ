resource "aws_eip" "nat" {
  count = length(var.public_subnet_cidrs)
  vpc   = true

  tags = {
    Name        = "${var.project}-${var.environment}-nat-eip-${count.index + 1}"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_nat_gateway" "main" {
  count         = length(var.public_subnet_cidrs)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name        = "${var.project}-${var.environment}-nat-${count.index + 1}"
    Environment = var.environment
    Project     = var.project
  }

  depends_on = [aws_internet_gateway.main]
} 