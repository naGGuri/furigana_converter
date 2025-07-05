# Backend/database/models/__init__.py

# 이 파일은 'models' 디렉토리를 Python 패키지로 만듭니다.
# 이 파일이 존재함으로써 Python은 'models' 디렉토리 내의 모듈들을 임포트할 수 있습니다.

# 모든 모델을 한 번에 임포트하여 다른 모듈에서 'from database import models'와 같이 사용할 수 있도록 합니다.
from .user import User
