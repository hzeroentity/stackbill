import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>© 2024 StackBill</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}