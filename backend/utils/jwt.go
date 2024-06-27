package utils

import (
	"github.com/golang-jwt/jwt/v5"
	log "github.com/sirupsen/logrus"
	"time"
)

type Token struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

const (
	JWTSecretKey   = "sipeed-nanokvm2024"
	ExpireDuration = 181 * 24 * time.Hour
)

func GenerateJWT(username string) (string, error) {
	claims := Token{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ExpireDuration)),
		},
	}

	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(JWTSecretKey))
}

func ParseJWT(jwtToken string) (*Token, error) {
	t, err := jwt.ParseWithClaims(jwtToken, &Token{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(JWTSecretKey), nil
	})

	if err != nil {
		log.Errorf("parse jwt error: %s", err)
		return nil, err
	}

	if claims, ok := t.Claims.(*Token); ok && t.Valid {
		return claims, nil
	} else {
		return nil, err
	}
}
