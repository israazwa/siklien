const Link = ({ href = "#", children, className = "", ...props }) => {
  return (
    <a href={href} className={`text-blue-500 hover:underline ${className}`} {...props}>
      {children}
    </a>
  );
};

export default Link;