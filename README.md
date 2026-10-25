# yildirimlar

[yildirimlar.com](https://yildirimlar.com) — statik site, Firebase Hosting (`collective-bucket` projesi, site `cbucket-yildirimlar`).

## Yerelde çalıştır

```sh
npm ci
npm run serve   # http://localhost:5056
```

## Yayınla

`main`'e push edince GitHub Actions `hosting:yildirimlar` hedefini deploy eder. PR'lar 7 günlük önizleme kanalına gider.

Elle: `npm run deploy`
