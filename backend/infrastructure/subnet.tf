data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_subnet" "public" {
  count             = length(var.public_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.public_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.project}-${var.environment}-public-subnet-${count.index + 1}"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name        = "${var.project}-${var.environment}-private-subnet-${count.index + 1}"
    Environment = var.environment
    Project     = var.project
  }
} 