import { Button as MuiButton, CircularProgress } from "@mui/material";

type Props = {
  children?: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  loadingText?: string;
};

const CustomButton = ({
  children,
  startIcon,
  endIcon,
  className = "w-fit!",
  onClick,
  type = "button",
  loading,
  disabled,
  size = "medium",
  fullWidth = true,
  loadingText = "Loading...",
}: Props) => {
  return (
    <MuiButton
      className={
        className +
        "!tracking-widest! font-medium! transition-all! duration-300! ease-in-out!"
      }
      onClick={onClick}
      type={type}
      disabled={Boolean(disabled || loading)}
      size={size}
      fullWidth={fullWidth}
      startIcon={loading ? undefined : startIcon}
      endIcon={loading ? undefined : endIcon}
      sx={{
        background: "#FF6900",
        textTransform: "capitalize",
        fontSize: "0.875rem", // text-sm
        padding: "0.4rem 0.8rem", // py-2 px-6
        borderRadius: "0.3rem",
        fontWeight: 500,
        color: "white",
        border: "none",
        boxShadow: "rgba(0, 0, 0, 0.2) 0px 5px 10px",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          background: "#FF6900",
          boxShadow: "rgba(0, 0, 0, 0.3) 0px 8px 15px",
        },
        "&.Mui-disabled": {
          background: "#525252",
          opacity: 0.7,
          color: "white",
          boxShadow: "none",
        },
        "@media (prefers-color-scheme: dark)": {
          background: "#FF6900",
        },
      }}
    >
      {loading ? (
        <span
          className="font-satoshi font-medium"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <CircularProgress size={20} color="inherit" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </MuiButton>
  );
};

export default CustomButton;
