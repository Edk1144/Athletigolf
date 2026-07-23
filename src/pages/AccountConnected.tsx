export default function AccountConnected() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-panel p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-dark">Account Connected</h1>
        <p className="mt-4 text-muted leading-relaxed">
          Your account has been connected successfully.
          <br />
          Please restart your app to continue.
        </p>
      </div>
    </div>
  );
}
