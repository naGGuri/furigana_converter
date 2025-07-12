# Backend/api/endpoints/__init__.py

# 이 파일은 'endpoints' 디렉토리를 Python 패키지로 만듭니다.
# 이 파일이 존재함으로써 Python은 'endpoints' 디렉토리 내의 모듈들을 임포트할 수 있습니다.

# 예를 들어, main.py에서 다음과 같이 임포트할 수 있습니다:
# from api.endpoints import ocr_router, chatbot_endpoints, auth_endpoints, history_router

from . import ocr_router
from . import chatbot_router
from . import auth_router
from . import history_router
