"use client";
import { toast } from "@/hooks/useToast";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import API from "@/components/client/api/AxiosClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  _id: string;
  name: string;
}

const CreateForumPage = () => {

  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await API.get("/forums/categories");
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed To Load Categories!",
        variant: "destructive"
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !category) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/forums/create", {
        title: title.trim(),
        description: description.trim(),
        category
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Forum post created successfully",
        });
        router.push(`/forums/${response.data.forum._id}`);
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Failed to create forum post",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating forum post:", error);
      toast({
        title: "Error",
        description: "Failed to create forum post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
        <div className="flex mb-5">
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-full px-4 py-2 hover:bg-muted transition-all"
            onClick={() => router.push("/forums")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Create New Forum Post</CardTitle>
          <CardDescription>Start A New Conversation With Community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter Title Of The Post"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={256}
              />
              <p className="text-xs text-gray-500">
                {title.length}/256 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                  ) : categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No categories available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="text-base"
                placeholder="Describe Your Topic In Detail"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                required
                maxLength={2048}
              />
              <p className="text-xs text-gray-500">
                {description.length}/2048 characters
              </p>
            </div>

            <div className="flex gap-2 pt-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateForumPage;