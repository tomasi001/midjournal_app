"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  subscribeUser,
  unsubscribeUser,
  sendNotification,
} from "@/app/actions";
import { useAuth } from "@/context/auth-context";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PwaManagerProps {
  mode: "dialog" | "inline";
}

export function PwaManager({ mode }: PwaManagerProps) {
  const { token } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [installPromptEvent, setInstallPromptEvent] = useState<
    | (Event & {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
      })
    | null
  >(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [showPostInstallInfoDialog, setShowPostInstallInfoDialog] =
    useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscriptionStatusKnown, setIsSubscriptionStatusKnown] =
    useState(false);

  useEffect(() => {
    if (token) {
      const decodedToken: { sub?: string } = jwtDecode(token);
      console.log("decodedToken", decodedToken);
      setUserEmail(decodedToken.sub || null);
    }
  }, [token]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(
        event as Event & {
          prompt: () => Promise<void>;
          userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
        }
      );
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }

    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as Window & typeof globalThis & { MSStream: unknown }).MSStream
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    if (
      mode === "dialog" &&
      !standalone &&
      installPromptEvent &&
      sessionStorage.getItem("installPrompted") !== "true"
    ) {
      setShowInstallDialog(true);
      sessionStorage.setItem("installPrompted", "true");
    }

    if (
      mode === "dialog" &&
      standalone &&
      isSubscriptionStatusKnown &&
      !subscription &&
      sessionStorage.getItem("subscribePrompted") !== "true"
    ) {
      setShowSubscribeDialog(true);
      sessionStorage.setItem("subscribePrompted", "true");
    }
  }, [installPromptEvent, subscription, mode, isSubscriptionStatusKnown]);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
    setIsSubscriptionStatusKnown(true);
  }

  async function subscribeToPush() {
    setIsSubscribing(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      setSubscription(sub);
      const serializedSub = JSON.parse(JSON.stringify(sub));
      await subscribeUser(serializedSub);
      console.log("Successfully subscribed to push notifications.");
      setShowSubscribeDialog(false);
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
    } finally {
      setIsSubscribing(false);
    }
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message);
      setMessage("");
    }
  }

  const handleInstallClick = async () => {
    if (!installPromptEvent) {
      return;
    }
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    setShowInstallDialog(false);
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
      setShowPostInstallInfoDialog(true);
    } else {
      console.log("User dismissed the install prompt");
    }
    setInstallPromptEvent(null);
  };

  const showTestNotification =
    userEmail === "tom.shields001@gmail.com" && mode === "inline";

  const InstallComponent = (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Install Midjournal</h3>
      <p>
        Install the app on your device to enable push notifications and get a
        native-like experience.
      </p>
      {installPromptEvent ? (
        <Button onClick={handleInstallClick}>Add to Home Screen</Button>
      ) : (
        <p className="text-sm text-muted-foreground mt-2">
          Installation is available through your browser&apos;s menu.
          <br />
          <br />
          If you have already installed the application, you should be able to
          find the mid journal icon in your applications and open the app as a
          standalone application.
        </p>
      )}
      {isIOS && (
        <p className="text-sm text-muted-foreground mt-2">
          To install on iOS: tap the share icon and then &apos;Add to Home
          Screen&apos;.
        </p>
      )}
    </div>
  );

  const SubscribeComponent = (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Push Notifications</h3>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          {showTestNotification && (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Test message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button onClick={sendTestNotification}>Send Test</Button>
            </div>
          )}
          <Button onClick={unsubscribeFromPush} variant="destructive">
            Unsubscribe
          </Button>
        </>
      ) : (
        <>
          <p>Get updates by subscribing to notifications.</p>
          <Button onClick={subscribeToPush} disabled={isSubscribing}>
            {isSubscribing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubscribing ? "Subscribing..." : "Subscribe"}
          </Button>
        </>
      )}
    </div>
  );

  if (mode === "dialog") {
    return (
      <>
        <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Install Midjournal</DialogTitle>
              <DialogDescription>
                Install the app on your device for a better experience.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">{InstallComponent}</div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowInstallDialog(false)}
              >
                Not now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showPostInstallInfoDialog}
          onOpenChange={setShowPostInstallInfoDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Installation Started!</DialogTitle>
              <DialogDescription>
                Midjournal is being added to your Home Screen. Open the app from
                there to finish setting up notifications.
                <br />
                <br />
                Please note this can take a minute or two.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowPostInstallInfoDialog(false)}>
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showSubscribeDialog}
          onOpenChange={setShowSubscribeDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enable Push Notifications</DialogTitle>
              <DialogDescription>
                Stay up-to-date with the latest updates.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">{SubscribeComponent}</div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSubscribeDialog(false)}
              >
                Not now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (mode === "inline") {
    if (!isSupported) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Your browser does not support the features needed for installation
              or push notifications.
            </p>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card>
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
          <CardDescription>
            Manage app installation and push notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isStandalone && InstallComponent}
          {isStandalone && SubscribeComponent}
        </CardContent>
      </Card>
    );
  }

  return null;
}
