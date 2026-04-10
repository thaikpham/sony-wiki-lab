interface PhotoboothStudioShellProps {
  activePath: string;
  children: React.ReactNode;
}

export default function PhotoboothStudioShell({
  activePath: _activePath,
  children,
}: PhotoboothStudioShellProps) {
  return (
    <div className="space-y-8 py-8 text-[#1a1c1c]">
      {children}
    </div>
  );
}
