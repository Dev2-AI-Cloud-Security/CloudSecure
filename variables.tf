variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "allowed_ips" {
  description = "List of allowed IP addresses for SSH access"
  type        = list(string)
  default     = ["YOUR_IP/32"]
} 