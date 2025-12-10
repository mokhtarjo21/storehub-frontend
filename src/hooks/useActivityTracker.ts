import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

type ActivityAction =
  | "page_view"
  | "search"
  | "product_click"
  | "product_view"
  | "service_view"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout"
  | "order_placed"
  | "login"
  | "logout"
  | "register"
  | "filter_applied"
  | "other";

interface ActivityData {
  action: ActivityAction;
  target?: string;
  metadata?: Record<string, any>;
}

const API_BASE_URL = "http://192.168.1.7:8000/api/auth";

let sessionId: string | null = null;

const getSessionId = (): string => {
  if (sessionId) return sessionId;

  sessionId = localStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    localStorage.setItem("session_id", sessionId);
  }
  return sessionId;
};

const logActivity = async (data: ActivityData) => {
  try {
    const accessToken = localStorage.getItem("access_token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    await fetch(`${API_BASE_URL}/activity/log/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...data,
        session_id: getSessionId(),
      }),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

export const useActivityTracker = () => {
  const { user } = useAuth();
  const hasLoggedPageView = useRef(false);

  const trackActivity = useCallback(async (data: ActivityData) => {
    await logActivity(data);
  }, []);

  const trackPageView = useCallback(
    async (pagePath: string) => {
      await trackActivity({
        action: "page_view",
        target: pagePath,
        metadata: {
          user_id: user?.id,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [trackActivity, user]
  );

  const trackSearch = useCallback(
    async (searchQuery: string, resultsCount?: number) => {
      await trackActivity({
        action: "search",
        target: searchQuery,
        metadata: {
          query: searchQuery,
          results_count: resultsCount,
          user_id: user?.id,
        },
      });
    },
    [trackActivity, user]
  );

  const trackProductClick = useCallback(
    async (productId: string, productName: string) => {
      await trackActivity({
        action: "product_click",
        target: `/products/${productId}`,
        metadata: {
          product_id: productId,
          product_name: productName,
          user_id: user?.id,
        },
      });
    },
    [trackActivity, user]
  );

  const trackProductView = useCallback(
    async (productId: string, productName: string) => {
      await trackActivity({
        action: "product_view",
        target: `/products/${productId}`,
        metadata: {
          product_id: productId,
          product_name: productName,
          user_id: user?.id,
        },
      });
    },
    [trackActivity, user]
  );

  const trackServiceView = useCallback(
    async (serviceId: string, serviceName: string) => {
      await trackActivity({
        action: "service_view",
        target: `/services/${serviceId}`,
        metadata: {
          service_id: serviceId,
          service_name: serviceName,
          user_id: user?.id,
        },
      });
    },
    [trackActivity, user]
  );

  const trackAddToCart = useCallback(
    async (
      itemId: string,
      itemName: string,
      itemType: "product" | "service"
    ) => {
      await trackActivity({
        action: "add_to_cart",
        target: `${itemType}/${itemId}`,
        metadata: {
          item_id: itemId,
          item_name: itemName,
          item_type: itemType,
          user_id: user?.id,
        },
      });
    },
    [trackActivity, user]
  );

  const trackRemoveFromCart = useCallback(
    async (
      itemId: string,
      itemName: string,
      itemType: "product" | "service"
    ) => {
      await trackActivity({
        action: "remove_from_cart",
        target: `${itemType}/${itemId}`,
        metadata: {
          item_id: itemId,
          item_name: itemName,
          item_type: itemType,
          user_id: user?.id,
        },
      });
    },
    [trackActivity, user]
  );

  const trackCheckout = useCallback(
    async (cartValue: number, itemCount: number) => {
      await trackActivity({
        action: "checkout",
        target: "/checkout",
        metadata: {
          cart_value: cartValue,
          item_count: itemCount,
          user_id: user?.id,
        },
      });
    },
    [trackActivity, user]
  );

  const trackOrderPlaced = useCallback(
    async (orderId: string, orderValue: number) => {
      await trackActivity({
        action: "order_placed",
        target: `/orders/${orderId}`,
        metadata: {
          order_id: orderId,
          order_value: orderValue,
          user_id: user?.id,
        },
      });
    },
    [trackActivity, user]
  );

  const trackFilterApplied = useCallback(
    async (filters: Record<string, any>) => {
      await trackActivity({
        action: "filter_applied",
        target: window.location.pathname,
        metadata: {
          filters,
          user_id: user?.id,
        },
      });
    },
    [trackActivity, user]
  );

  useEffect(() => {
    if (!hasLoggedPageView.current) {
      trackPageView(window.location.pathname);
      hasLoggedPageView.current = true;
    }
  }, [trackPageView]);

  return {
    trackActivity,
    trackPageView,
    trackSearch,
    trackProductClick,
    trackProductView,
    trackServiceView,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckout,
    trackOrderPlaced,
    trackFilterApplied,
  };
};
