import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../lib/auth";
import { useTranslation } from "../i18n";

export default function ProtectedRoute({ children }) {
  const { t } = useTranslation();
  const location = useLocation();

  // If user is not logged in → redirect to login with message
  if (!getToken()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: t("please_login", "Please login first"), from: location.pathname }}
      />
    );
  }

  return children;
}
