# FOREMIRA 移行準備

作業ブランチ prepare/foremira。本番反映は未承認。mainへのpush・merge、DNS/Pages/Auth設定変更は行わない。

全体の試験・URL対応・バックアップ・未確認事項と切り替え手順は `/workspace/foremira-migration/README.md` を参照。

## ローカル回帰試験

`python3 -m unittest discover -s tests -v`

Python Playwrightと/usr/bin/chromiumを使う。2つの使い捨てローカルHTTPサーバーと新規ブラウザプロファイルのみを使用し、外部通信は遮断する。ソケットを拒否される実行サンドボックスではサポートされた昇格経路で実行する。
