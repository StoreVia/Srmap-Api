"use client";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trimText } from "@/fullStackUtils/utils/functions";
import API from "@/components/client/api/AxiosClient";
import { getCategoryColor, getStatusColor } from "@/fullStackUtils/forums/colors";
import { Search, RotateCw, Trash2, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ForumPost {
  _id: string;
  username: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  status: string;
}

const ForumsPage = () => {

  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastCreatedAt, setLastCreatedAt] = useState<string | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    loadPosts();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setCurrentUser(decoded.username);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  };

  const loadPosts = async (loadMore = false, search = "") => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else if (!search) {
        setLoading(true);
      }

      const params = new URLSearchParams();
      params.append("limit", "10");

      if (loadMore && lastCreatedAt && lastId && !search) {
        params.append("lastCreatedAt", lastCreatedAt);
        params.append("lastId", lastId);
      }

      if (search) {
        params.append("search", search);
        setIsSearching(true);
      }

      const response = await API.get(`/forums/load?${params}`);

      if (response.data.success) {
        const newPosts = response.data.forums;

        if (loadMore && !search) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }

        if (newPosts.length > 0 && !search) {
          const lastPost = newPosts[newPosts.length - 1];
          setLastCreatedAt(lastPost.createdAt);
          setLastId(lastPost._id);
        }
        setHasMore(newPosts.length === 10 && !search);
      } else {
        toast({
          title: "Error",
          description: "Failed to load forum posts",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error loading forum posts:", error);
      toast({
        title: "Error",
        description: "Failed to load forum posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPosts(false, searchQuery.trim());
  };

  const clearSearch = () => {
    setSearchQuery("");
    loadPosts();
  };

  const loadMorePosts = () => {
    if (hasMore && !loadingMore && !searchQuery) {
      loadPosts(true);
    }
  };

  const refreshPosts = () => {
    setLastCreatedAt(null);
    setLastId(null);
    loadPosts();
  };

  const handleDeletePost = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this forum post? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await API.delete(`/forums/${postId}`);
      if (response.data.success) {
        setPosts(prev => prev.filter(post => post._id !== postId));
        toast({
          title: "Success",
          description: "Forum post deleted successfully",
        });
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

  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search forums by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
            {searchQuery && (
              <Button type="button" variant="outline" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </form>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 mb-4">
          <Button
            onClick={refreshPosts}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="w-full">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex gap-2 mb-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forums by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
          {searchQuery && (
            <Button type="button" variant="outline" onClick={clearSearch}>
              Clear
            </Button>
          )}
        </form>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 mb-4">
        <Button
          onClick={refreshPosts}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {isSearching ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="w-full">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex gap-2 mb-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? "No Matching Forum Found" : "No Forums Posted Yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery ? "You Can Even Search By Username!" : "Be First One To Start Discussion!"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {searchQuery && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Found {posts.length} result{posts.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            </div>
          )}
          <div className="grid gap-4">
            {posts.map((post) => (
              <Link key={post._id} href={`/forums/${post._id}`} passHref>
                <Card className="w-full hover:shadow-md transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 transition-opacity"
                            onClick={(e) => handleDeletePost(post._id, e)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive dark:text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className={getCategoryColor(post.category)}>
                        {post.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        @{post.username}
                      </Badge>
                      <span className="text-xs text-muted-foreground self-center">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <CardDescription className="text-base">
                      {trimText(post.description, 256)}
                    </CardDescription>

                    <div className="mt-4 flex justify-start">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 rounded-full px-4 py-2 hover:bg-muted transition-all"
                      >
                        Reply
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {hasMore && !searchQuery && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={loadMorePosts}
                disabled={loadingMore}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {loadingMore ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </span>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}

          {loadingMore && (
            <div className="grid gap-4 mt-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={`skeleton-${index}`} className="w-full">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <div className="flex gap-2 mb-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <button
        onClick={() => router.push("/forums/create")}
        className="fixed bottom-24 right-6 bg-primary text-white dark:text-black rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors z-50"
        aria-label="Create Forum Post"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ForumsPage;