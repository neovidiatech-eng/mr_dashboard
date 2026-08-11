import api from "../lib/axios";
import {
  CreatePostInput,
  UpdatePostInput,
  PostsQueryParams,
  PostsResponse,
  SinglePostResponse,
} from "../types/postss";

export const getPosts = async (params?: PostsQueryParams): Promise<PostsResponse> => {
  const res = await api.get<PostsResponse>("/posts", { params });
  return res.data;
};

export const getPostById = async (id: string): Promise<SinglePostResponse> => {
  const res = await api.get<SinglePostResponse>(`/posts/${id}`);
  return res.data;
};

export const createPost = async (data: CreatePostInput): Promise<SinglePostResponse> => {
  const res = await api.post<SinglePostResponse>("/posts", data);
  return res.data;
};

export const updatePost = async (id: string, data: UpdatePostInput): Promise<SinglePostResponse> => {
  const res = await api.patch<SinglePostResponse>(`/posts/${id}`, data);
  return res.data;
};

export const deletePost = async (id: string): Promise<void> => {
  await api.delete(`/posts/${id}`);
};
