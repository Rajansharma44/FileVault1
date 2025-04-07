import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, Folder, Plus, FileText, Grid3X3, Tag, Search, Info, Share2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuthHook";
import { useFiles } from "@/hooks/useFiles";
import { formatBytes, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Define a list of categories with colors
const DEFAULT_CATEGORIES = [
  { name: "Documents", color: "bg-blue-500" },
  { name: "Images", color: "bg-green-500" },
  { name: "Videos", color: "bg-purple-500" },
  { name: "Music", color: "bg-amber-500" },
  { name: "Archives", color: "bg-rose-500" },
  { name: "Others", color: "bg-slate-500" },
];

// Helper function to determine category based on file type
function getCategoryForFile(file: any) {
  const type = file.type?.toLowerCase() || "";
  
  if (type.includes("document") || type.includes("pdf") || type.includes("text") || type.includes("doc") || type.includes("sheet") || type.includes("presentation")) {
    return "Documents";
  } else if (type.includes("image")) {
    return "Images";
  } else if (type.includes("video")) {
    return "Videos";
  } else if (type.includes("audio") || type.includes("music")) {
    return "Music";
  } else if (type.includes("zip") || type.includes("archive") || type.includes("compressed")) {
    return "Archives";
  } else {
    return "Others";
  }
}

export default function Categories() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { files, isLoading, updateFile } = useFiles();
  const { toast } = useToast();
  
  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [userCategories, setUserCategories] = useState<Array<{name: string, color: string}>>([]);
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false);
  
  // Get all files that are not deleted
  const activeFiles = files?.filter(file => !file.isDeleted) || [];
  
  // Combine default and user categories
  const allCategories = [...DEFAULT_CATEGORIES, ...userCategories];
  
  // Categorize files
  const categorizedFiles = activeFiles.reduce((acc, file) => {
    const category = file.category || getCategoryForFile(file);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(file);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Get category counts
  const categoryCounts = Object.keys(categorizedFiles).reduce((acc, category) => {
    acc[category] = categorizedFiles[category].length;
    return acc;
  }, {} as Record<string, number>);
  
  // Get filtered files based on selected category
  const filteredFiles = selectedCategory 
    ? [...(categorizedFiles[selectedCategory] || [])]
    : activeFiles;
  
  // Apply search filter
  const searchedFiles = searchQuery
    ? filteredFiles.filter(
        file => file.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (file.type && file.type.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : filteredFiles;
  
  // Apply sorting
  const sortedFiles = [...searchedFiles].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "date-asc":
        return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
      case "date-desc":
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      case "size-asc":
        return a.size - b.size;
      case "size-desc":
        return b.size - a.size;
      default:
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    }
  });
  
  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Category name required",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }
    
    // Check if category already exists
    if (allCategories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      toast({
        title: "Category already exists",
        description: "Please enter a different category name",
        variant: "destructive",
      });
      return;
    }
    
    // Generate a random color
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-emerald-500", "bg-cyan-500", "bg-indigo-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newCategory = {
      name: newCategoryName.trim(),
      color: randomColor,
    };
    
    setUserCategories([...userCategories, newCategory]);
    setNewCategoryName("");
    setNewCategoryDialogOpen(false);
    
    toast({
      title: "Category created",
      description: `${newCategory.name} category has been created`,
    });
  };
  
  const handleAssignCategory = async (fileId: number, categoryName: string) => {
    try {
      await updateFile(fileId, { category: categoryName });
      toast({
        title: "Category assigned",
        description: `File moved to ${categoryName}`,
      });
    } catch (error) {
      toast({
        title: "Error assigning category",
        description: "Could not update file category",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header
        title="Categories"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onToggleSidebar={() => {}}
        onUploadClick={() => setLocation("/")}
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Category Selection */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Categories</h2>
                <Dialog open={newCategoryDialogOpen} onOpenChange={setNewCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>New Category</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create new category</DialogTitle>
                      <DialogDescription>
                        Add a new category to organize your files.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="categoryName">Category name</Label>
                        <Input
                          id="categoryName"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setNewCategoryDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateCategory}>
                        Create
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card
                  className={`cursor-pointer hover:border-primary transition-colors ${
                    selectedCategory === null ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <div className="bg-primary/10 rounded-full p-3 mb-3">
                      <Grid3X3 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium">All Files</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activeFiles.length} {activeFiles.length === 1 ? "file" : "files"}
                    </p>
                  </CardContent>
                </Card>
                
                {allCategories.map((category) => (
                  <Card
                    key={category.name}
                    className={`cursor-pointer hover:border-primary transition-colors ${
                      selectedCategory === category.name ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                      <div className={`${category.color} rounded-full p-3 mb-3`}>
                        <Tag className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {categoryCounts[category.name] || 0} {(categoryCounts[category.name] || 0) === 1 ? "file" : "files"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  {selectedCategory ? `${selectedCategory} Files` : "All Files"}
                </h3>
                <Badge variant="outline" className="text-muted-foreground">
                  {sortedFiles.length} {sortedFiles.length === 1 ? "file" : "files"}
                </Badge>
              </div>
              
              {sortedFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No files found</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    {searchQuery 
                      ? `No results found for "${searchQuery}"`
                      : selectedCategory 
                        ? `No files in the ${selectedCategory} category`
                        : "You don't have any files yet"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedFiles.map((file) => (
                    <Card key={file.id} className="overflow-hidden hover:border-primary transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 rounded-md p-2">
                            <FileText className="h-8 w-8 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{file.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <span>{formatBytes(file.size)}</span>
                              <span className="mx-2">•</span>
                              <span>{formatDate(file.dateAdded)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between border-t p-2 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center">
                          <Badge variant="outline" className="text-xs">
                            {file.category || getCategoryForFile(file)}
                          </Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Tag className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Assign category</DialogTitle>
                                <DialogDescription>
                                  Select a category for this file
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                {allCategories.map((category) => (
                                  <Button
                                    key={category.name}
                                    variant="outline"
                                    className={`justify-start ${
                                      (file.category || getCategoryForFile(file)) === category.name
                                        ? "border-primary"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      handleAssignCategory(file.id, category.name);
                                      document.getElementById("closeDialog")?.click();
                                    }}
                                  >
                                    <span className={`${category.color} h-2 w-2 rounded-full mr-2`}></span>
                                    {category.name}
                                  </Button>
                                ))}
                              </div>
                              <DialogFooter className="sm:justify-end">
                                <Button 
                                  id="closeDialog"
                                  type="button" 
                                  variant="secondary"
                                >
                                  Close
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Info className="h-4 w-4" />
                          </Button>
                          
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}