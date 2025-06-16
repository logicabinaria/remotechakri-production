"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
// Button import removed as it's only used for newsletter

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface BlogSidebarProps {
  categories: Category[];
  popularTags: Tag[];
  activeCategorySlug?: string;
  activeTagSlug?: string;
}

export default function BlogSidebar({ categories, popularTags, activeCategorySlug, activeTagSlug }: BlogSidebarProps) {
  // Newsletter state variables temporarily removed
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter categories and tags based on search term
  const filteredCategories = searchTerm
    ? categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : categories;
  
  const filteredTags = searchTerm
    ? popularTags.filter(tag => 
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : popularTags;
  
  return (
    <div className="space-y-6">
      {/* Search Box */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Search categories & tags"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>
      
      {/* Categories Card */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div key={category.id} className="flex justify-between items-center">
                  <Link 
                    href={`/blog?category=${category.slug}`}
                    className={`text-sm hover:text-primary transition-colors ${activeCategorySlug === category.slug ? 'font-semibold text-primary' : ''}`}
                  >
                    {category.name}
                  </Link>
                  <Badge variant={activeCategorySlug === category.slug ? "default" : "outline"}>
                    {category.count}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No categories found</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Popular Tags Card */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                  <Badge 
                    variant={activeTagSlug === tag.slug ? "default" : "secondary"} 
                    className="cursor-pointer hover:bg-secondary/80"
                  >
                    {tag.name} ({tag.count})
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tags found</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Newsletter Subscription - Temporarily hidden
      <Card>
        <CardHeader>
          <CardTitle>Subscribe to Newsletter</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubscribe}>
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="Your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                {subscribed ? "Subscribed!" : "Subscribe"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      */}
    </div>
  );
}
