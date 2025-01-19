"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, ImageIcon, Loader2Icon, SendIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import ImageUpload from "./ImageUpload";
import { useUser } from "@clerk/nextjs";
import { createPost } from "@/actions/post.action";

export default function CreateChallenge() {
  const { user } = useUser();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState<string>(""); // Used for the challenge post body
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [showImageUpload, setShowImageUpload] = useState<boolean>(false);
  const [todos, setTodos] = useState<string[]>([]);
  const [todoInput, setTodoInput] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const addTodo = () => {
    if (todoInput.trim() !== "") {
      setTodos([...todos, todoInput.trim()]);
      setTodoInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validation
    if (!title.trim() || !description.trim() || todos.length === 0 || !date) {
      toast.error("Please fill in all required fields.");
      return;
    }
  
    setIsPosting(true);
    try {
      const content = `${title}\n${description}\nTodos: ${todos.join(", ")}\nDate: ${format(date, "MM/dd/yyyy")}`;
      const image = imageUrl; // Image URL can be passed as the image parameter
  
      // Call the backend function with correct parameters
      const result = await createPost(content, image);
      if (result?.success) {
        // Reset form
        setTitle("");
        setDescription("");
        setTodos([]);
        setImageUrl("");
        setContent("");
        setShowImageUpload(false);
        setDate(new Date());
  
        toast.success("Challenge created successfully!");
      }
    } catch (error) {
      console.error("Failed to create challenge:", error);
      toast.error("Failed to create challenge.");
    } finally {
      setIsPosting(false);
    }
  };
  
  return (
    <form
  className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
  onSubmit={handleSubmit}
>
  <h1 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
    <CalendarIcon /> Create New Challenge
  </h1>
  {/* Title */}
  <div className="mb-4">
    <Label htmlFor="title" className="text-gray-900 dark:text-gray-100">
      Challenge Title
    </Label>
    <Input
      id="title"
      name="title"
      placeholder="Enter challenge title"
      className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
  </div>
  {/* Description */}
  <div className="mb-4">
    <Label htmlFor="description" className="text-gray-900 dark:text-gray-100">
      Description
    </Label>
    <Textarea
      id="description"
      name="description"
      placeholder="Describe the challenge"
      className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
    />
  </div>
  {/* Todo List */}
  <div className="mb-4">
    <Label className="text-gray-900 dark:text-gray-100">
      Todo List (10 XP per todo)
    </Label>
    <div className="flex gap-2 items-center">
      <Input
        value={todoInput}
        onChange={(e) => setTodoInput(e.target.value)}
        placeholder="Add a new todo"
        className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
      />
      <Button type="button" onClick={addTodo} className="dark:bg-gray-600">
        +
      </Button>
    </div>
    <ul className="mt-2 space-y-1">
      {todos.map((todo, index) => (
        <li
          key={index}
          className="text-sm text-gray-900 dark:text-gray-300"
        >
          • {todo}
        </li>
      ))}
    </ul>
  </div>
  {/* Challenge Date */}
  <div className="mb-4">
    <Label className="text-gray-900 dark:text-gray-100">Challenge Date</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        >
          {date ? format(date, "MM/dd/yyyy") : "Select a date"}
        </Button>
      </PopoverTrigger>
    </Popover>
  </div>
  {/* Image Upload */}
  <div className="mb-4">
    {showImageUpload || imageUrl ? (
      <div className="border rounded-lg p-4 dark:border-gray-600">
        <ImageUpload
          endpoint="postImage"
          value={imageUrl}
          onChange={(url) => {
            setImageUrl(url);
            if (!url) setShowImageUpload(false);
          }}
        />
      </div>
    ) : (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-primary dark:text-gray-100 dark:hover:text-primary"
        onClick={() => setShowImageUpload(!showImageUpload)}
        disabled={isPosting}
      >
        <ImageIcon className="size-4 mr-2" />
        Add Cover Image
      </Button>
    )}
  </div>
  {/* Submit Button */}
  <div className="flex items-center justify-between border-t pt-4 dark:border-gray-600">
    <Button
      type="submit"
      className="flex items-center dark:bg-gray-700 dark:text-gray-100"
      disabled={isPosting}
    >
      {isPosting ? (
        <>
          <Loader2Icon className="size-4 mr-2 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <SendIcon className="size-4 mr-2" />
          Create Challenge
        </>
      )}
    </Button>
  </div>
</form>

  );
}
