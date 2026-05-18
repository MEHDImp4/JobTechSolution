# Generated migration - add duree_minutes field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('entretiens', '0002_entretien_points_amelioration_entretien_points_forts_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='entretien',
            name='duree_minutes',
            field=models.PositiveIntegerField(default=60),
        ),
    ]
