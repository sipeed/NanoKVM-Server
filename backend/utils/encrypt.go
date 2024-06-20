package utils

import (
	"github.com/mervick/aes-everywhere/go/aes256"
	log "github.com/sirupsen/logrus"
	"net/url"
)

const SecretKey = "nanokvm-sipeed-2024"

func Decrypt(ciphertext string) (string, error) {
	defer func() {
		if err := recover(); err != nil {
			log.Errorf("decrypt failed: %s", err)
		}
	}()

	if ciphertext == "" {
		return "", nil
	}

	decrypt := aes256.Decrypt(ciphertext, SecretKey)

	return decrypt, nil
}

func DecodeDecrypt(ciphertext string) (string, error) {
	decode, err := url.QueryUnescape(ciphertext)
	if err != nil {
		log.Errorf("decode ciphertext failed: %s", err)
		return "", err
	}

	return Decrypt(decode)
}
