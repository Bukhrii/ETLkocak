from __future__ import annotations
import pendulum
from airflow.models.dag import DAG
from airflow.providers.docker.operators.docker import DockerOperator

with DAG(
    dag_id="etl_banking_dag",
    start_date=pendulum.datetime(2024, 1, 1, tz="Asia/Makassar"),
    schedule="0 1 * * *",
    catchup=False,
    tags=["banking", "etl"],
) as dag:
    task_schema = DockerOperator(
        task_id="run_schema_js",
        image="etl-mysql:latest",
        command="node schema.js",
        docker_url="unix://var/run/docker.sock",
        network_mode="bridge",
        auto_remove=True,
    )

    task_seed = DockerOperator(
        task_id="run_seed_js",
        image="etl-mysql:latest",
        command="node seed.js",
        docker_url="unix://var/run/docker.sock",
        network_mode="bridge",
        auto_remove=True,
    )

    task_etl = DockerOperator(
        task_id="run_etl_js",
        image="etl-mysql:latest",
        command="node etl.js",
        docker_url="unix://var/run/docker.sock",
        network_mode="bridge",
        auto_remove=True,
    )

    task_schema >> task_seed >> task_etl