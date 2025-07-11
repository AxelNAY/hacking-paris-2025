"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Créer l'enum pour le type de contenu
    content_type_enum = postgresql.ENUM('image', 'text', 'audio', name='contenttype')
    content_type_enum.create(op.get_bind())
    
    # Créer l'enum pour la description du contenu
    content_description_enum = postgresql.ENUM(
        'logo', 'slogan', 'tiffo', 'vetement', 'lyrics', 'musique', 
        name='contentdescription'
    )
    content_description_enum.create(op.get_bind())
    
    # Créer la table user
    op.create_table('user',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('wallet_address', sa.String(), nullable=True),
        sa.Column('first_name', sa.String(), nullable=True),
        sa.Column('last_name', sa.String(), nullable=True),
        sa.Column('country', sa.String(), nullable=True),
        sa.Column('avatar_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('wallet_address')
    )
    
    # Créer la table content
    op.create_table('content',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('type', content_type_enum, nullable=True),
        sa.Column('description', content_description_enum, nullable=True),
        sa.Column('prompt', sa.String(), nullable=True),
        sa.Column('ipfs_url', sa.String(), nullable=True),
        sa.Column('votes', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Créer la table vote
    op.create_table('vote',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('voter_id', sa.Integer(), nullable=True),
        sa.Column('content_id', sa.Integer(), nullable=True),
        sa.Column('amount', sa.Float(), nullable=True),
        sa.Column('tx_hash', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['content_id'], ['content.id'], ),
        sa.ForeignKeyConstraint(['voter_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Créer la table badge_nft
    op.create_table('badge_nft',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('nft_token_id', sa.String(), nullable=True),
        sa.Column('metadata_ipfs', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Créer les index pour l'optimisation
    op.create_index(op.f('ix_user_wallet_address'), 'user', ['wallet_address'], unique=True)
    op.create_index(op.f('ix_content_user_id'), 'content', ['user_id'], unique=False)
    op.create_index(op.f('ix_content_type'), 'content', ['type'], unique=False)
    op.create_index(op.f('ix_content_created_at'), 'content', ['created_at'], unique=False)
    op.create_index(op.f('ix_vote_voter_id'), 'vote', ['voter_id'], unique=False)
    op.create_index(op.f('ix_vote_content_id'), 'vote', ['content_id'], unique=False)
    op.create_index(op.f('ix_badge_nft_user_id'), 'badge_nft', ['user_id'], unique=False)

def downgrade() -> None:
    # Supprimer les index
    op.drop_index(op.f('ix_badge_nft_user_id'), table_name='badge_nft')
    op.drop_index(op.f('ix_vote_content_id'), table_name='vote')
    op.drop_index(op.f('ix_vote_voter_id'), table_name='vote')
    op.drop_index(op.f('ix_content_created_at'), table_name='content')
    op.drop_index(op.f('ix_content_type'), table_name='content')
    op.drop_index(op.f('ix_content_user_id'), table_name='content')
    op.drop_index(op.f('ix_user_wallet_address'), table_name='user')
    
    # Supprimer les tables
    op.drop_table('badge_nft')
    op.drop_table('vote')
    op.drop_table('content')
    op.drop_table('user')
    
    # Supprimer les enums
    op.execute('DROP TYPE IF EXISTS contentdescription')
    op.execute('DROP TYPE IF EXISTS contenttype')