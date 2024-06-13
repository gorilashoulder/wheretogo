import { ChakraProvider } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./page/Home.jsx";
import Lobby from "./page/Lobby.jsx";
import PostWrite from "./page/post/PostWrite.jsx";

import { MemberInfo } from "./page/member/MemberInfo.jsx"; // 라우터 설정
import { MemberSignup } from "./page/member/MemberSignup.jsx";
import { CommentComponent } from "./component/Comment/CommentComponent.jsx";
import { PostView } from "./page/post/PostView.jsx";
import PostList from "./page/post/PostList.jsx";
import { PostEdit } from "./page/post/PostEdit.jsx";
import { MemberLogin } from "./page/member/MemberLogin.jsx";
import LoginProvider from "./component/LoginProvider.jsx";
import { FindPassword } from "./page/member/FindPassword.jsx";
import MemberEdit from "./page/member/MemberEdit.jsx";

// 라우터 설정
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />, // Nav 와 Outlet 구성
    children: [
      {
        index: true,
        element: <Lobby />,
      }, // 메인페이지를 담당
      { path: "signup", element: <MemberSignup /> },
      { path: "login", element: <MemberLogin /> },
      { path: "findPassword", element: <FindPassword /> },
      { path: "memberinfo", element: <MemberInfo /> },
      { path: "comment", element: <CommentComponent /> },
      { path: "post/write", element: <PostWrite /> },
      { path: "member/edit", element: <MemberEdit /> },
      { path: "post/:postId/edit", element: <PostEdit /> },
      { path: "post/list", element: <PostList /> },
      { path: "post/:postId", element: <PostView /> },
    ],
  },
]);

function App() {
  return (
    <LoginProvider>
      <ChakraProvider>
        <RouterProvider router={router} />
      </ChakraProvider>
    </LoginProvider>
  );
}

export default App;
