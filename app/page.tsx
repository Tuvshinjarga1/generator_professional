"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Cloud, Sparkles, ImageIcon } from "lucide-react";
import Image from "next/image";

interface BlogPost {
  title: string;
  content: string;
  tags: string[];
  imageUrl?: string;
}

export default function CloudBlogGenerator() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const generateBlogPost = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate blog post");
      }

      const data = await response.json();
      setBlogPost(data);
    } catch (error) {
      console.error("Error generating blog post:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    if (!blogPost?.title) return;

    setIsGeneratingImage(true);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Professional illustration for blog post about: ${blogPost.title}. Modern, clean, technology-focused design.`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      setBlogPost((prev) =>
        prev ? { ...prev, imageUrl: data.imageUrl } : null
      );
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Cloud className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Cloud Tech Blog Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Cloud технологийн сэдвээр мэргэжлийн нийтлэл үүсгэж, холбогдох зураг
            бүтээнэ үү
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Сэдэв оруулах
              </CardTitle>
              <CardDescription>
                Cloud технологийн аль нэг сэдвийг оруулна уу (жишээ: "Kubernetes
                Security", "Serverless Architecture", "Multi-Cloud Strategy")
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Cloud технологийн сэдэв оруулна уу..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && generateBlogPost()}
              />
              <Button
                onClick={generateBlogPost}
                disabled={isGenerating || !topic.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Нийтлэл үүсгэж байна...
                  </>
                ) : (
                  "Нийтлэл үүсгэх"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Blog Post */}
          {blogPost && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{blogPost.title}</CardTitle>
                  <Button
                    onClick={generateImage}
                    disabled={isGeneratingImage}
                    variant="outline"
                    size="sm"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Зураг үүсгэж байна...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Зураг үүсгэх
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {blogPost.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {blogPost.imageUrl && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <Image
                      src={blogPost.imageUrl || "/placeholder.svg"}
                      alt={blogPost.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {blogPost.content.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
