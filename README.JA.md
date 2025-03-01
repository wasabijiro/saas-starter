# Next.js SaaSスターター

**Next.js**を使用して、認証、Stripeによる決済、ログインユーザー向けのダッシュボードをサポートするSaaSアプリケーションのスターターテンプレートです。

**デモ: [https://next-saas-start.vercel.app/](https://next-saas-start.vercel.app/)**

## 特徴

- アニメーション付きターミナル要素を持つマーケティングランディングページ (`/`)
- Stripe Checkoutと連携した料金ページ (`/pricing`)
- ユーザーやチームに対するCRUD操作が可能なダッシュボードページ
- オーナーとメンバーの役割を持つ基本的なRBAC（ロールベースのアクセス制御）
- Stripeカスタマーポータルによるサブスクリプション管理
- クッキーに保存されたJWTを用いたメール/パスワード認証
- ログイン済みルートを保護するグローバルミドルウェア
- サーバーアクションを保護したり、Zodスキーマを検証するローカルミドルウェア
- ユーザーイベントのアクティビティログシステム

## 技術スタック

- **フレームワーク**: [Next.js](https://nextjs.org/)
- **データベース**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **決済**: [Stripe](https://stripe.com/)
- **UIライブラリ**: [shadcn/ui](https://ui.shadcn.com/)

## はじめに

```bash
git clone https://github.com/nextjs/saas-starter
cd saas-starter
pnpm install
```

## ローカルでの実行

同梱のセットアップスクリプトを使用して`.env`ファイルを作成します:

```bash
pnpm db:setup
```

次に、データベースのマイグレーションを実行し、デフォルトのユーザーとチームでデータベースをシードします:

```bash
pnpm db:migrate
pnpm db:seed
```

これにより、以下のユーザーとチームが作成されます:

- ユーザー: `test@test.com`
- パスワード: `admin123`

もちろん、`/sign-up`から新しいユーザーを作成することも可能です。

最後に、Next.jsの開発サーバーを起動します:

```bash
pnpm dev
```

ブラウザで[http://localhost:3000](http://localhost:3000)を開き、アプリを確認できます。

オプションとして、StripeのCLIを使用してローカルでStripeのWebhookをリッスンし、サブスクリプションの変更イベントを処理できます:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 決済のテスト

Stripeの決済をテストするには、以下のテストカード情報を使用します:

- カード番号: `4242 4242 4242 4242`
- 有効期限: 任意の将来の日付
- CVC: 任意の3桁の番号

## 本番環境への移行

SaaSアプリケーションを本番環境にデプロイする準備が整ったら、以下の手順に従います:

### 本番環境用のStripe Webhookの設定

1. Stripeダッシュボードで、本番環境用の新しいWebhookを作成します。
2. エンドポイントURLを本番環境のAPIルート（例: `https://yourdomain.com/api/stripe/webhook`）に設定します。
3. リッスンするイベントを選択します（例: `checkout.session.completed`, `customer.subscription.updated`）。

### Vercelへのデプロイ

1. コードをGitHubリポジトリにプッシュします。
2. リポジトリを[Vercel](https://vercel.com/)に接続し、デプロイします。
3. Vercelのデプロイプロセスに従い、プロジェクトの設定を行います。

### 環境変数の追加

Vercelのプロジェクト設定（またはデプロイ中）で、必要な環境変数をすべて追加します。これらの値は本番環境用に更新してください。主な環境変数は以下の通りです:

1. `BASE_URL`: 本番環境のドメインを設定します。
2. `STRIPE_SECRET_KEY`: 本番環境用のStripeシークレットキーを使用します。
3. `STRIPE_WEBHOOK_SECRET`: 手順1で作成した本番環境用Webhookのシークレットを使用します。
4. `POSTGRES_URL`: 本番環境のデータベースURLを設定します。
5. `AUTH_SECRET`: ランダムな文字列を設定します。`openssl rand -base64 32`で生成できます。

## その他のテンプレート

このテンプレートは学習リソースとして意図的にミニマルに設計されていますが、より充実した機能を持つコミュニティの有料版もあります:

- https://achromatic.dev
- https://shipfa.st
- https://makerkit.dev 