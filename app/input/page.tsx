"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InputPage() {
  const [posts, setPosts] = useState([
    { text: "", likes: 0, date: "" }
  ]);

  const addPost = () => {
    setPosts([...posts, { text: "", likes: 0, date: "" }]);
  };

  const updatePost = (
    index: number,
    field: "text" | "likes" | "date",
    value: string | number
  ) => {
    const newPosts = [...posts];
    newPosts[index] = { ...newPosts[index], [field]: value };
    setPosts(newPosts);
  };

  const generateData = () => {
    const data = posts
      .filter(p => p.text && p.likes >= 0)
      .map((p, i) => ({
        id: String(i + 1),
        created_time: p.date || new Date().toISOString(),
        text: p.text,
        like_count: Number(p.likes),
        permalink: `https://www.threads.net/t/${i + 1}`
      }));

    // 데이터를 localStorage에 저장
    localStorage.setItem('myThreadsData', JSON.stringify(data));
    alert('데이터가 저장되었습니다! 메인 페이지로 이동하세요.');
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">내 Threads 데이터 입력</h1>
        <p className="text-muted-foreground">
          Threads 앱에서 확인한 게시물 정보를 입력하세요
        </p>
      </div>

      <div className="space-y-4">
        {posts.map((post, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">게시물 내용</label>
                <Input
                  placeholder="게시물 텍스트를 입력하세요"
                  value={post.text}
                  onChange={(e) => updatePost(index, 'text', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">좋아요 수</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={post.likes}
                    onChange={(e) => updatePost(index, 'likes', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">날짜 (선택사항)</label>
                  <Input
                    type="date"
                    value={post.date}
                    onChange={(e) => updatePost(index, 'date', e.target.value + 'T12:00:00Z')}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <Button onClick={addPost} variant="outline" className="flex-1">
          게시물 추가
        </Button>
        <Button onClick={generateData} className="flex-1">
          대시보드 생성
        </Button>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">💡 사용법:</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Threads 앱에서 본인 프로필로 이동</li>
          <li>게시물 내용과 좋아요 수를 확인</li>
          <li>위 폼에 5-10개 정도 입력</li>
          <li>&quot;대시보드 생성&quot; 클릭</li>
          <li>메인 페이지(/)로 이동해서 본인 데이터 확인!</li>
        </ol>
      </div>
    </div>
  );
}