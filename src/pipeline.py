"""Data processing pipeline with stages and transforms."""
import time, logging, hashlib, json, statistics
from typing import Any, Callable, Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)

class StageStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class DataRecord:
    id: str
    data: Dict[str, Any]
    metadata: Dict[str, Any] = field(default_factory=dict)
    source: str = ""
    created_at: float = field(default_factory=time.time)

@dataclass
class StageResult:
    stage_name: str
    status: StageStatus
    records_in: int
    records_out: int
    duration_ms: float
    errors: List[str] = field(default_factory=list)

class Transform:
    """Base class for data transforms."""
    name: str = "base"

    def apply(self, records: List[DataRecord]) -> List[DataRecord]:
        return records

class FilterTransform(Transform):
    name = "filter"
    def __init__(self, condition: Callable[[DataRecord], bool]):
        self.condition = condition
    def apply(self, records: List[DataRecord]) -> List[DataRecord]:
        return [r for r in records if self.condition(r)]

class MapTransform(Transform):
    name = "map"
    def __init__(self, fn: Callable[[Dict], Dict]):
        self.fn = fn
    def apply(self, records: List[DataRecord]) -> List[DataRecord]:
        for r in records:
            r.data = self.fn(r.data)
        return records

class DeduplicateTransform(Transform):
    name = "deduplicate"
    def __init__(self, key_field: str):
        self.key_field = key_field
    def apply(self, records: List[DataRecord]) -> List[DataRecord]:
        seen = set()
        result = []
        for r in records:
            key = str(r.data.get(self.key_field, r.id))
            if key not in seen:
                seen.add(key)
                result.append(r)
        return result

class DataPipeline:
    """Configurable data processing pipeline."""

    def __init__(self, name: str = "pipeline"):
        self.name = name
        self.stages: List[Tuple[str, Transform]] = []
        self.results: List[StageResult] = []
        self._run_count = 0

    def add_stage(self, name: str, transform: Transform) -> "DataPipeline":
        self.stages.append((name, transform))
        return self

    def run(self, records: List[DataRecord]) -> List[DataRecord]:
        self._run_count += 1
        self.results = []
        current = records
        logger.info(f"Pipeline '{self.name}' starting with {len(records)} records")

        for stage_name, transform in self.stages:
            start = time.time()
            records_in = len(current)
            try:
                current = transform.apply(current)
                elapsed = (time.time() - start) * 1000
                self.results.append(StageResult(stage_name, StageStatus.COMPLETED,
                                               records_in, len(current), elapsed))
                logger.info(f"  Stage '{stage_name}': {records_in} -> {len(current)} ({elapsed:.1f}ms)")
            except Exception as e:
                elapsed = (time.time() - start) * 1000
                self.results.append(StageResult(stage_name, StageStatus.FAILED,
                                               records_in, 0, elapsed, [str(e)]))
                logger.error(f"  Stage '{stage_name}' failed: {e}")
                break

        return current

    def get_summary(self) -> Dict:
        return {"pipeline": self.name, "stages": len(self.stages), "runs": self._run_count,
                "last_run": [{"stage": r.stage_name, "status": r.status.value,
                             "in": r.records_in, "out": r.records_out,
                             "ms": r.duration_ms} for r in self.results]}
