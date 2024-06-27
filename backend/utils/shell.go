package utils

import (
	log "github.com/sirupsen/logrus"
	"os/exec"
)

// RunCommand 执行 shell 命令
func RunCommand(command string) error {
	cmd := exec.Command("sh", "-c", command)
	_, err := cmd.CombinedOutput()
	if err != nil {
		log.Errorf("run command %s failed: %s", command, err)
		return err
	}

	return nil
}

func RunCommandBackend(command string) {
	cmd := exec.Command("sh", "-c", command)
	cmd.Stdout = nil
	cmd.Stderr = nil
	go cmd.Run()
}
