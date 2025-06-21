import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Notification, Notifications } from "@/components/ui/Notifications";

type ToolStatus = {
  name: string;
  cmd: string;
  pkg: string;
  fallbackUrl?: string; // Add fallback URL for manual installation
};

const STORAGE_KEY = "tools_check_status";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export default function CommandChecker() {
  // Fixed: Renamed from InstallTools to match component purpose
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toolsStatus, setToolsStatus] = useState<
    Record<string, boolean | null>
  >({
    python3: null,
    npx: null,
    uv: null,
  });

  const [isInstalling, setIsInstalling] = useState<Record<string, boolean>>({});
  const [_installProgress, setInstallProgress] = useState<
    Record<string, number>
  >({});
  const [isChecking, setIsChecking] = useState(false); // Added: Track checking state

  const toolsConfig: ToolStatus[] = [
    {
      name: "Python",
      cmd: "python3",
      pkg: "python3",
      fallbackUrl: "https://www.python.org/downloads/",
    },
    {
      name: "npx|node",
      cmd: "npx",
      pkg: "nodejs", // Fixed: Better to use 'node' for most package managers
      fallbackUrl: "https://nodejs.org/en/download/",
    },
    {
      name: "uv|uvx",
      cmd: "uv",
      pkg: "uv",
      fallbackUrl: "https://github.com/astral-sh/uv",
    },
  ];

  useEffect(() => {
    // Check cache first
    const checkCachedStatus = () => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const { status, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setToolsStatus(status);
            return true; // Cache is valid
          }
        }
      } catch (error) {
        console.error("Error reading cached status:", error);
      }
      return false; // Cache is invalid or doesn't exist
    };

    if (!checkCachedStatus()) {
      checkAllTools();
    }
  }, []); // Fixed: Removed firstLoad dependency

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id }]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  async function checkAllTools(isManualCheck: boolean = false) {
    if (isChecking) return; // Prevent duplicate checks

    setIsChecking(true);
    const updatedStatus = { ...toolsStatus };

    try {
      // Check all tools in parallel for better performance
      const checkPromises = toolsConfig.map(async (tool) => {
        try {
          const installed = await invoke<boolean>("check_command_exists", {
            command: tool.cmd,
          });
          console.log(
            `${tool.name}: ${installed ? "installed" : "not installed"}`,
          );

          if (!installed && !isManualCheck) {
            // Remove any existing notifications for this tool
            setNotifications((prev) =>
              prev.filter(
                (n) => !n.title.includes(tool.name) || n.type === "error",
              ),
            );

            addNotification({
              title: `${tool.name} is not installed`,
              type: "info",
              action: {
                label: t("install"),
                onClick: async () => await installTool(tool),
                loading: isInstalling[tool.cmd],
              },
            });
          } else if (installed && isManualCheck) {
            // Only show installed notification on manual check
            addNotification({
              title: `${tool.name} is installed`,
              type: "success",
              autoClose: 3000, // Auto close after 3 seconds
            });
          }

          return { cmd: tool.cmd, status: installed };
        } catch (error) {
          console.error(`Failed to check ${tool.name}:`, error);
          addNotification({
            title: `Failed to check ${tool.name}`,
            type: "error",
            message: error instanceof Error ? error.message : String(error),
          });
          return { cmd: tool.cmd, status: false };
        }
      });

      const results = await Promise.all(checkPromises);

      // Update status from results
      results.forEach(({ cmd, status }) => {
        updatedStatus[cmd] = status;
      });

      setToolsStatus(updatedStatus);

      // Cache the results
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            status: updatedStatus,
            timestamp: Date.now(),
          }),
        );
      } catch (error) {
        console.error("Error caching status:", error);
      }
    } finally {
      setIsChecking(false);
    }
  }

  async function installTool(tool: ToolStatus) {
    if (isInstalling[tool.cmd]) {
      return;
    }

    setIsInstalling((prev) => ({ ...prev, [tool.cmd]: true }));

    // Remove any existing notifications for this tool
    setNotifications((prev) =>
      prev.filter((n) => !n.title.includes(tool.name) || n.type === "error"),
    );

    const installingNotificationId = Math.random().toString(36).substr(2, 9);

    // Initialize progress
    setInstallProgress((prev) => ({ ...prev, [tool.cmd]: 0 }));

    const installingNotification = {
      id: installingNotificationId,
      title: `Installing ${tool.name}...`,
      type: "info" as const,
      showProgress: true,
      progress: 0,
    };

    setNotifications((prev) => [...prev, installingNotification]);

    // Simulate progress updates (since Tauri doesn't provide real progress)
    const progressInterval = setInterval(() => {
      setInstallProgress((prev) => {
        const currentProgress = prev[tool.cmd] || 0;
        if (currentProgress < 80) {
          // Don't go to 100% until actually done
          const newProgress = Math.min(
            currentProgress + Math.random() * 15,
            80,
          );

          // Update the notification with new progress
          setNotifications((notifications) =>
            notifications.map((n) =>
              n.id === installingNotificationId
                ? { ...n, progress: Math.round(newProgress) }
                : n,
            ),
          );

          return { ...prev, [tool.cmd]: newProgress };
        }
        return prev;
      });
    }, 500);

    try {
      const result = await invoke<string>("install_command", {
        packageName: tool.pkg,
        packageManager: undefined, // Fixed: Use consistent parameter name
      });
      console.log(result);

      // Clear progress interval
      clearInterval(progressInterval);

      // Complete the progress to 100%
      setNotifications((notifications) =>
        notifications.map((n) =>
          n.id === installingNotificationId ? { ...n, progress: 100 } : n,
        ),
      );

      // Wait a moment to show 100% completion
      setTimeout(() => {
        // Remove the installing notification
        setNotifications((prev) =>
          prev.filter((n) => n.id !== installingNotificationId),
        );

        addNotification({
          title: `${tool.name} installed successfully`,
          type: "success",
          autoClose: 5000,
        });
      }, 500);

      setToolsStatus((prev) => ({
        ...prev,
        [tool.cmd]: true,
      }));

      // Update cache
      try {
        const updatedStatus = { ...toolsStatus, [tool.cmd]: true };
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            status: updatedStatus,
            timestamp: Date.now(),
          }),
        );
      } catch (error) {
        console.error("Error updating cache:", error);
      }
    } catch (error) {
      // Clear progress interval
      clearInterval(progressInterval);

      // Remove the installing notification
      setNotifications((prev) =>
        prev.filter((n) => n.id !== installingNotificationId),
      );

      addNotification({
        title: `Failed to install ${tool.name}`,
        type: "error",
        message: error instanceof Error ? error.message : String(error),
        action: tool.fallbackUrl
          ? {
              label: "Manual Install",
              onClick: () => {
                open(tool.fallbackUrl!);
              },
            }
          : undefined,
      });
      console.error(`Failed to install ${tool.name}:`, error);
    } finally {
      setIsInstalling((prev) => ({ ...prev, [tool.cmd]: false }));
      setInstallProgress((prev) => ({ ...prev, [tool.cmd]: 0 }));
    }
  }

  return (
    <div>
      <Notifications
        className="z-50"
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}
