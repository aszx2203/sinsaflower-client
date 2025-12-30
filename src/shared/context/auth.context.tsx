"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { login as loginService } from "@/features/auth/services/auth.service";
// import { logout as logoutService } from "@/features/auth/services/auth.service";
import { User } from "../types/user";
import { deleteCookie, setCookie } from "../lib/cookie.client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  login: (
    username: string,
    password: string
  ) => Promise<
    { success: true; user: User } | { success: false; message: string }
  >;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 내에서만 사용할 수 있습니다.");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>();
  const [loading, setLoading] = useState(false);
  const [dashboardInfo, setDashboardInfo] = useState({
    balance: 0,
    sinsaPoints: 0,
    gradePoints: 0,
    unconfirmedOrders: 0,
    undeliveredOrders: 0,
  });

  // 대시보드 정보 로드
  const loadDashboardInfo = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/dashboard/info", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardInfo(data);
      }
    } catch (error) {
      console.error("대시보드 정보 로드 실패:", error);
    }
  }, [user]);

  // 페이지 로드 시 로컬스토리지에서 사용자 정보 복원
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
        }
      } catch (error) {
        console.error("사용자 정보 복원 실패:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 사용자가 로그인하면 대시보드 정보 로드
  useEffect(() => {
    if (user) {
      loadDashboardInfo();
    } else {
      setDashboardInfo({
        balance: 0,
        sinsaPoints: 0,
        gradePoints: 0,
        unconfirmedOrders: 0,
        undeliveredOrders: 0,
      });
    }
  }, [user, loadDashboardInfo]);

  // 인증 상태 새로고침
  const refreshAuthState = () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        return userData;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error("인증 상태 새로고침 실패:", error);
      setUser(null);
      return null;
    }
  };

  // 대시보드 정보 새로고침
  const refreshDashboardInfo = useCallback(() => {
    loadDashboardInfo();
  }, [loadDashboardInfo]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      console.log("로그인 시도:", username);
      console.log("로그인 시도:", password);
      const response = await loginService(username, password);

      // 백엔드 응답을 프론트엔드 형태로 매핑 (더미데이터 없이)
      const user = {
        username: response.userId,
        name: response.name,
        role: response.role,
        phoneNumber: response.phoneNumber,
      };

      setUser(user);
      setCookie("accessToken", response.token, { path: "/" });
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(user));
      return { success: true, user: user };
    } catch (error) {
      console.error("로그인 실패:", error);
      return {
        success: false,
        message:
          error.response?.data?.details || "로그인 중 오류가 발생했습니다.",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    deleteCookie("accessToken");
    setUser(null);
    setDashboardInfo({
      balance: 0,
      sinsaPoints: 0,
      gradePoints: 0,
      unconfirmedOrders: 0,
      undeliveredOrders: 0,
    });
  };

  const register = async (userData: User) => {
    try {
      const response = await register(userData);
      // 백엔드 응답의 message 사용
      return {
        success: true,
        message:
          response.message ||
          "회원가입이 완료되었습니다. 관리자 승인 후 로그인하실 수 있습니다.",
      };
    } catch (error) {
      console.error("회원가입 실패:", error);
      return {
        success: false,
        message: error.response?.data?.message || "회원가입에 실패했습니다.",
      };
    }
  };

  const value = useMemo(
    () => ({
      user,
      dashboardInfo,
      login,
      logout,
      register,
      refreshAuthState,
      refreshDashboardInfo,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "ADMIN",
    }),
    [user, dashboardInfo, loading, refreshDashboardInfo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
