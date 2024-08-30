package tailscale

import (
	"NanoKVM-Server/backend/utils"
	"bufio"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"io"
	"os"
	"os/exec"
	"regexp"
	"strings"
)

func isTailscaleExist() bool {
	_, err1 := os.Stat(TailscalePath)
	_, err2 := os.Stat(TailscaledPath)

	return err1 == nil && err2 == nil
}

func getStatus() (Status, error) {
	var status Status

	cmd := exec.Command("tailscale", "status", "--json")
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Debugf("get tailscale status failed: %s", err)
		return status, err
	}

	err = json.Unmarshal(output, &status)
	if err != nil {
		log.Debugf("unmarshal tailscale status failed: %s", err)
		return status, err
	}

	return status, nil
}

func startService() error {
	for _, filePath := range []string{TailscalePath, TailscaledPath} {
		if err := utils.EnsurePermission(filePath, 0100); err != nil {
			return err
		}
	}

	cmd := exec.Command("/etc/init.d/S98tailscaled", "start")
	if err := cmd.Run(); err != nil {
		return err
	}

	return nil
}

func parseLoginUrl(r io.Reader) string {
	reader := bufio.NewReader(r)
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			log.Errorf("reading line failed: %s", err)
			return ""
		}

		if strings.Contains(line, "https") {
			reg := regexp.MustCompile("\\s+")
			return reg.ReplaceAllString(line, "")
		}
	}
}
