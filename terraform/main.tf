# Configure the AWS provider
provider "aws" {
  region = "us-east-1"
}

# Fetch the default VPC
data "aws_vpc" "default" {
  default = true
}

# Fetch the default subnet in the default VPC
data "aws_subnet" "default" {
  vpc_id            = data.aws_vpc.default.id
  availability_zone = "us-east-1a" # Adjust if needed
  default_for_az    = true
}

# Reference the existing security group
data "aws_security_group" "cloudsecure_sg" {
  name   = "cloudsecure-sg"
  vpc_id = data.aws_vpc.default.id
}

# Fetch the latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

# Check for existing instances with the tag Name=cloudsecure-instance
data "aws_instances" "existing_instances" {
  instance_tags = {
    Name = "cloudsecure-instance"
  }

  instance_state_names = ["running"]
}

# Create EC2 instance only if no existing instances are found
resource "aws_instance" "cloudsecure" {
  count         = length(data.aws_instances.existing_instances.ids) == 0 ? var.instance_count : 0
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = "t2.micro"
  key_name      = "cloudsecure-key"

  subnet_id              = data.aws_subnet.default.id
  vpc_security_group_ids = [data.aws_security_group.cloudsecure_sg.id]

  # Increase root volume size to 10 GiB
  root_block_device {
    volume_size = 10 # GiB
    volume_type = "gp3" # General Purpose SSD, Free Tier-eligible
  }

  user_data = <<-EOF
              #!/bin/bash
              dnf update -y
              dnf install -y docker
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ec2-user
              EOF

  tags = {
    Name = "cloudsecure-instance"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Variable for instance count
variable "instance_count" {
  description = "Number of instances to create if none exist"
  type        = number
  default     = 1
}

# Output the public IP of the instance
output "instance_ip" {
  description = "Public IP of the cloudsecure instance"
  value       = length(aws_instance.cloudsecure) > 0 ? aws_instance.cloudsecure[0].public_ip : (length(data.aws_instances.existing_instances.public_ips) > 0 ? data.aws_instances.existing_instances.public_ips[0] : null)
}