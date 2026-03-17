"use client";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import API from "@/components/client/api/AxiosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryColor, getStatusColor } from "@/fullStackUtils/forums/colors";
import { MoreVertical, Pin, RotateCw, Trash2, X, ArrowLeft, RefreshCcw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ForumPost {
  _id: string;
  username: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  status: string;
  pinnedAnswer?: string;
}

interface Comment {
  _id: string;
  username: string;
  content: string;
  createdAt: string;
  isPinned?: boolean;
}

const ForumPage = () => {
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchCurrentUser();
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchCurrentUser = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setCurrentUser(decoded.username);
      } catch (error) { }
    }
  };

  const fetchPost = async () => {
    try {
      const response = await API.get(`/forums/${id}`);
      if (response.data.success) setPost(response.data.forum);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed To Load Poast!",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await API.get(`/forums/${id}/comments`);
      if (response.data.success) setComments(response.data.comments);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed To Load Comments!",
        variant: "destructive"
      });
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const response = await API.post(`/forums/${id}/comments`, { content: newComment });
      if (response.data.success) {
        setComments(prev => [response.data.comment, ...prev]);
        setNewComment("");
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Failed To Add Comment!",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed To Add Comment!",
        variant: "destructive"
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const refreshComments = async () => {
    setCommentsLoading(true);
    try {
      const response = await API.get(`/forums/${id}/comments`);
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed To Refresh Comments",
        variant: "destructive"
      });
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCloseForum = async () => {
    try {
      const response = await API.patch(`/forums/${id}/status`, {
        status: "closed"
      });

      if (response.data.success) {
        setPost(prev => prev ? { ...prev, status: "closed" } : null);
        toast({
          title: "Success",
          description: "Forum closed successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Failed to close forum",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close forum",
        variant: "destructive"
      });
    }
  };

  const handleOpenForum = async () => {
    try {
      const response = await API.patch(`/forums/${id}/status`, {
        status: "open"
      });

      if (response.data.success) {
        setPost(prev => prev ? { ...prev, status: "open" } : null);
        toast({
          title: "Success",
          description: "Forum reopened successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Failed to reopen forum",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reopen forum",
        variant: "destructive"
      });
    }
  };

  const handlePinAnswer = async (commentId: string) => {
    try {
      const response = await API.patch(`/forums/${id}/pin`, {
        commentId
      });

      if (response.data.success) {
        setPost(prev => prev ? { ...prev, pinnedAnswer: commentId } : null);
        setComments(prev => prev.map(comment => ({
          ...comment,
          isPinned: comment._id === commentId
        })));
        toast({
          title: "Success",
          description: "Answer pinned successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Failed to pin answer",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error pinning answer:", error);
      toast({
        title: "Error",
        description: "Failed to pin answer",
        variant: "destructive"
      });
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this forum post? All comments will also be deleted. This action cannot be undone.")) {
      return;
    }

    try {
      const response = await API.delete(`/forums/${id}`);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Forum post deleted successfully",
        });
        router.push("/forums");
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Failed to delete forum post",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting forum post:", error);
      toast({
        title: "Error",
        description: "Failed to delete forum post",
        variant: "destructive"
      });
    }
  };

  const isPostOwner = post && post.username === currentUser;
  const canCloseForum = isPostOwner && post.status === "open";
  const canPinAnswer = isPostOwner && post.status === "open";

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="mt-5 flex">
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-full px-4 py-2 hover:bg-muted transition-all"
            onClick={() => router.push("/forums")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <Card className="w-full">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="flex gap-2 mb-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Post not found</h3>
              <p className="text-muted-foreground">The requested forum post could not be found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-start">
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-full px-4 py-2 hover:bg-muted transition-all"
          onClick={() => router.push("/forums")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">{post.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(post.status)}>
                {post.status}
              </Badge>
              {(isPostOwner || isAdmin) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {post.status === "open" ? (
                      (canCloseForum || isAdmin) && (
                        <DropdownMenuItem
                          onClick={handleCloseForum}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 focus:text-amber-700 focus:bg-amber-50"
                        >
                          <X className="mr-2 h-4 w-4" />
                          <span>Close Forum</span>
                        </DropdownMenuItem>
                      )
                    ) : (
                      (isPostOwner || isAdmin) && (
                        <DropdownMenuItem
                          onClick={handleOpenForum}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 focus:text-green-700 focus:bg-green-50"
                        >
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          <span>Reopen Forum</span>
                        </DropdownMenuItem>
                      )
                    )}

                    {isAdmin && (
                      <DropdownMenuItem
                        onClick={handleDeletePost}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete Post</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>

                </DropdownMenu>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className={getCategoryColor(post.category)}>
              {post.category}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              @{post.username}
            </Badge>
            <span className="text-sm text-muted-foreground self-center">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-7">{post.description}</p>
        </CardContent>
      </Card>

      {post.status === "open" && (
        <Card>
          <CardHeader>
            <CardTitle>Add a Comment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                className="text-base"
                placeholder="Write Your Comment Here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                maxLength={2048}
              />
              <p className="text-xs text-gray-500">
                {newComment.length}/2048 characters
              </p>
              <Button
                onClick={handleAddComment}
                disabled={commentLoading || !newComment.trim()}
              >
                {commentLoading ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Comments ({comments.length})</CardTitle>
            <Button
              onClick={refreshComments}
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={commentsLoading}
            >
              <RotateCw className={`h-4 w-4 ${commentsLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          {post.pinnedAnswer && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
              <Pin className="h-3 w-3 mr-1" /> Pinned Answer
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {commentsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="flex items-start gap-3 relative"
                >
                  {comment.isPinned && (
                    <div className="absolute left-0 top-0 -translate-x-2 -translate-y-2">
                      <Pin className="h-4 w-4 text-amber-500 fill-amber-500" />
                    </div>
                  )}
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {comment.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                      <span className="font-medium break-all">
                        @{comment.username}
                      </span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      {comment.isPinned && (
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 text-xs flex items-center"
                        >
                          <Pin className="h-3 w-3 mr-1" /> Pinned
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm break-words">{comment.content}</p>
                  </div>
                  {((canPinAnswer || isAdmin) && !comment.isPinned) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePinAnswer(comment._id)}>
                          <Pin className="h-4 w-4 mr-2" /> Pin As Answer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">Not Comments Yet. Be First Comment!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForumPage;