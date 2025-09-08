# web-watcher

🔍 사용자 맞춤형 웹사이트 변경 추적 및 지능형 알림 시스템. LLM을 활용하여 각 웹사이트의 다양한 HTML 태그 구조를 자동 분석하고, 사용자 관심사에 따른 변경사항을 스마트하게 감지하는 AI 기반 웹 모니터링 플랫폼

## System Architecture

![Web Watcher Architecture](./web-watcher.drawio.svg)

## 시스템 구성 요소

### API Server

- 사용자 요청을 처리하고 크롤링 작업을 관리
- 웹사이트 모니터링 설정 및 알림 규칙 관리
- SQS를 통한 크롤러와의 비동기 통신
- DynamoDB를 이용한 데이터 저장 및 조회

### Crawler

- 등록된 웹사이트의 실제 크롤링 작업 수행
- 웹사이트 변경사항 감지 및 분석
- 사용자 관심사 기반 콘텐츠 분류
- 변경 감지 시 알림 발송

### EventBridge

- 정기적인 크롤링 작업 스케줄링
- 시간 기반 이벤트 트리거 관리
- 크롤링 주기 설정 및 실행

### SQS (Simple Queue Service)

- API Server와 Crawler 간의 메시지 큐
- 크롤링 요청의 비동기 처리
- 작업 부하 분산 및 안정성 보장
