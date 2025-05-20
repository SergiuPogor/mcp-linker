import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Notification, Notifications } from "./ui/Notifications";

type ToolStatus = {
  name: string;
  cmd: string;
  pkg: string;
  fallbackUrl?: string; // Add fallback URL for manual installation
};

const STORAGE_KEY = "tools_check_status";

export default function InstallTools() {
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
  const [firstLoad, setFirstLoad] = useState(true);

  const toolsConfig: ToolStatus[] = [
    {
      name: "Python",
      cmd: "python3",
      pkg: "python3",
      fallbackUrl: "https://www.python.org/downloads/",
    },
    {
      name: "npx",
      cmd: "npx",
      pkg: "nodejs",
      fallbackUrl: "https://nodejs.org/en/download/",
    },
    {
      name: "UV",
      cmd: "uv",
      pkg: "uv",
      fallbackUrl: "https://github.com/astral-sh/uv",
    },
  ];

  useEffect(() => {
    if (firstLoad) {
      checkAllTools();
      setFirstLoad(false);
    }
  }, [firstLoad]);

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id }]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  async function checkAllTools(click: boolean = false) {
    const updatedStatus = { ...toolsStatus };

    for (const tool of toolsConfig) {
      try {
        const installed = await invoke<boolean>("check_command_exists", {
          command: tool.cmd,
        });
        console.log(
          `${tool.name}: ${installed ? "installed" : "not installed"}`,
        );

        if (!installed) {
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
        } else if (click) {
          // Only show installed notification on manual check
          addNotification({
            title: `${tool.name} is installed`,
            type: "success",
            autoClose: 3000, // Auto close after 3 seconds
          });
        }
        updatedStatus[tool.cmd] = installed;
      } catch (error) {
        console.error(`Failed to check ${tool.name}:`, error);
        updatedStatus[tool.cmd] = false;
        addNotification({
          title: `Failed to check ${tool.name}`,
          type: "error",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

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

    const installingNotification = {
      title: `Installing ${tool.name}...`,
      type: "info" as const,
    };

    addNotification(installingNotification);

    try {
      const result = await invoke<string>("install_command", {
        packageName: tool.pkg,
      });
      console.log(result);

      // Remove the installing notification
      setNotifications((prev) =>
        prev.filter((n) => n.title !== installingNotification.title),
      );

      addNotification({
        title: `${tool.name} installed successfully`,
        type: "success",
      });

      setToolsStatus((prev) => ({
        ...prev,
        [tool.cmd]: true,
      }));
    } catch (error) {
      // Remove the installing notification
      setNotifications((prev) =>
        prev.filter((n) => n.title !== installingNotification.title),
      );

      addNotification({
        title: `Failed to install ${tool.name}`,
        type: "error",
        message: error instanceof Error ? error.message : String(error),
        action: tool.fallbackUrl
          ? {
              label: "Install manually",
              onClick: () => window.open(tool.fallbackUrl, "_blank"),
            }
          : undefined,
      });
      console.error(`Failed to install ${tool.name}:`, error);
    } finally {
      setIsInstalling((prev) => ({ ...prev, [tool.cmd]: false }));
    }
  }

  return (
    <>
      <Notifications
        className="z-99"
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </>
  );
}
