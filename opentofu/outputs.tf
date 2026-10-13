output "server_public_ip" {
  value       = openstack_networking_floatingip_v2.fip.address
  description = "public ip"
}

output "web_url" {
  value       = "http://${openstack_networking_floatingip_v2.fip.address}"
  description = "url for the webpage"
}