provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "security_ai" {
  ami           = "ami-08b5b3a93ed654d19"
  instance_type = "t2.medium"
  key_name      = "new-key"  # Add this line
  user_data     = <<-EOF
                  #!/bin/bash
                  apt-get update -y
                  apt-get install -y docker.io
                  systemctl start docker
                  systemctl enable docker
                  docker run -d -p 5000:5000 ai-threat-detection
                  EOF
  tags = {
    Name = "Security-AI-Instance"
  }
}
output "instance_ip" {
  value = aws_instance.security_ai.public_ip
}