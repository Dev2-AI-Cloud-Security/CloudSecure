provider "aws" {
  region = "us-east-1"
}

# Reference the existing security group
data "aws_security_group" "cloudsecure_sg" {
  name   = "cloudsecure-sg"
  vpc_id = "vpc-06ba180dc12d2a77a"
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
  ami           = data.aws_ami.amazon_linux_2023.id # Use Amazon Linux 2023 AMI
  instance_type = "t2.micro"
  key_name      = "cloudsecure-key"

  vpc_security_group_ids = [data.aws_security_group.cloudsecure_sg.id]

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

variable "instance_count" {
  default = 1
}

output "instance_ip" {
  value = length(aws_instance.cloudsecure) > 0 ? aws_instance.cloudsecure[0].public_ip : (length(data.aws_instances.existing_instances.public_ips) > 0 ? data.aws_instances.existing_instances.public_ips[0] : null)
}