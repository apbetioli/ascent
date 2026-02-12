"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/app-name";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { Plus, Trash2, Copy, Key, Loader2 } from "lucide-react";

interface SettingsPageProps {
  user: { id: Id<"users">; email?: string };
  profile: {
    _id: Id<"profiles">;
    userId: Id<"users">;
    name?: string;
    timezone: string;
    hasPaid: boolean;
  } | null;
  tokens: Array<{ id: Id<"apiTokens">; name: string; created_at: string }>;
}

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Australia/Sydney",
];

export function SettingsPage({ user, profile, tokens }: SettingsPageProps) {
  const [name, setName] = useState(profile?.name ?? "");
  const [timezone, setTimezone] = useState(profile?.timezone ?? "UTC");
  const [isSaving, setIsSaving] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const router = useRouter();
  const updateProfileMutation = useMutation(api.profiles.updateProfile);
  const createApiTokenMutation = useMutation(api.apiTokens.createApiToken);
  const deleteApiTokenMutation = useMutation(api.apiTokens.deleteApiToken);
  const currentUserId = useQuery(api.profiles.getCurrentUserId);

  const handleSaveProfile = async () => {
    if (!currentUserId) return;
    setIsSaving(true);

    try {
      await updateProfileMutation({
        userId: currentUserId,
        name: name.trim(),
        timezone,
      });
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateToken = async () => {
    if (!newTokenName.trim() || !currentUserId) return;

    setIsCreatingToken(true);

    try {
      const data = await createApiTokenMutation({
        userId: currentUserId,
        name: newTokenName.trim(),
      });
      setNewToken(data.token);
      setNewTokenName("");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingToken(false);
    }
  };

  const handleDeleteToken = async (tokenId: Id<"apiTokens">) => {
    if (!currentUserId) return;
    try {
      await deleteApiTokenMutation({ tokenId, userId: currentUserId });
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopyToken = () => {
    if (newToken) {
      navigator.clipboard.writeText(newToken);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and API tokens
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email ?? ""} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Used for recurring goal calculations
            </p>
          </div>
          <Button onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>API Tokens</CardTitle>
          <CardDescription>
            {`Create tokens to access the ${APP_NAME} API for automation`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Token
              </Button>
            </DialogTrigger>
            <DialogContent>
              {newToken ? (
                <>
                  <DialogHeader>
                    <DialogTitle>Token Created</DialogTitle>
                    <DialogDescription>
                      Copy your token now. You won&apos;t be able to see it
                      again!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                      {newToken}
                    </div>
                    <Button onClick={handleCopyToken} className="w-full">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Token
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewToken(null);
                        setTokenDialogOpen(false);
                      }}
                    >
                      Done
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Create API Token</DialogTitle>
                    <DialogDescription>
                      Give your token a name to help you remember what it&apos;s
                      for.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="token-name">Token Name</Label>
                      <Input
                        id="token-name"
                        placeholder="e.g., My Automation Script"
                        value={newTokenName}
                        onChange={(e) => setNewTokenName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setTokenDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateToken}
                      disabled={isCreatingToken || !newTokenName.trim()}
                    >
                      {isCreatingToken && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Token
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {tokens.length > 0 ? (
            <div className="space-y-2">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{token.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Created{" "}
                        {formatDistanceToNow(new Date(token.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Token</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{token.name}
                          &quot;? Any applications using this token will no
                          longer be able to access the API.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDeleteToken(token.id as Id<"apiTokens">)
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No API tokens yet. Create one to start using the API.
            </p>
          )}
        </CardContent>
      </Card> */}
    </div>
  );
}
