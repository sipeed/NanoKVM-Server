package auth

const (
	PasswordFile = "/etc/kvm/pwd"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
